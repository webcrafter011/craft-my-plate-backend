const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", UserSchema);

const MenuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  availability: { type: Boolean, default: true },
});

MenuSchema.pre("remove", async function (next) {
  try {
    await Order.updateMany(
      { "items.itemId": this._id },
      { $pull: { items: { itemId: this._id } } }
    );
    next();
  } catch (err) {
    next(err);
  }
});

const Menu = mongoose.model("Menu", MenuSchema);

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Menu" },
      quantity: Number,
    },
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});
const Order = mongoose.model("Order", OrderSchema);

const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).send("Access Denied: No token provided");

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send("Invalid or expired token");
  }
};

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send("Missing fields");

  const existingUser = await User.findOne({ username });
  if (existingUser) return res.status(400).send("Username already exists");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new User({ username, password: hashedPassword });
  await user.save();
  res.status(201).send("User registered");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send("Missing fields");

  const user = await User.findOne({ username });
  if (!user) return res.status(404).send("User not found");

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).send("Invalid credentials");

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ token });
});

app.get("/menu", async (req, res) => {
  try {
    const menu = await Menu.find();
    if (!menu.length) return res.status(404).send("No menu items found");
    res.json(menu);
  } catch (err) {
    res.status(500).send("Error fetching menu: " + err.message);
  }
});

app.post("/menu", authenticate, async (req, res) => {
  const { name, category, price, availability } = req.body;

  if (!name || !category || price === undefined)
    return res.status(400).send("Missing fields");

  try {
    const menuItem = new Menu({
      name,
      category,
      price,
      availability,
    });
    await menuItem.save();
    res.status(201).send("Menu item created");
  } catch (err) {
    res.status(500).send("Error creating menu item: " + err.message);
  }
});

app.delete("/menu/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const orders = await Order.find({ "items.itemId": id });
    if (orders.length > 0) {
      return res
        .status(400)
        .send("Cannot delete menu item: It has been ordered");
    }

    const menuItem = await Menu.findByIdAndDelete(id);
    if (!menuItem) return res.status(404).send("Menu item not found");
    res.send("Menu item deleted");
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.get("/orders", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).populate(
      "items.itemId"
    );

    orders.forEach((order) => {
      order.items = order.items.filter((item) => item.itemId !== null);
    });

    res.json(orders);
  } catch (err) {
    res.status(500).send("Error fetching orders: " + err.message);
  }
});

app.post("/order", authenticate, async (req, res) => {
  const { items } = req.body;
  if (!items || !items.length) return res.status(400).send("No items provided");

  let totalAmount = 0;
  for (const item of items) {
    const menuItem = await Menu.findById(item.itemId);
    if (!menuItem) return res.status(404).send(`Item ${item.itemId} not found`);
    totalAmount += menuItem.price * item.quantity;
  }

  const order = new Order({
    userId: req.user.id,
    items,
    totalAmount,
  });

  await order.save();
  res.status(201).json(order);
});

app.delete("/order/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).send("Order not found");

    if (order.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .send("You are not authorized to delete this order");
    }

    await order.deleteOne();
    res.send("Order deleted");
  } catch (err) {
    res.status(500).send("Error deleting order: " + err.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
