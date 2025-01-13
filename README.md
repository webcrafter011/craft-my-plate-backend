# **Craft My Plate Backend**

This repository contains the backend for the **Craft My Plate** application, built using Node.js, Express, and MongoDB. It provides a REST API for user authentication, menu management, and order management.

---

## **Table of Contents**

1. [Overview](#overview)  
2. [Features](#features)  
3. [Technologies Used](#technologies-used)  
4. [Setup Instructions](#setup-instructions)  
5. [Environment Variables](#environment-variables)  
6. [API Documentation](#api-documentation)  
   - [Authentication Routes](#authentication-routes)  
   - [Menu Routes](#menu-routes)  
   - [Order Routes](#order-routes)  
7. [Testing with Postman](#testing-with-postman)  
8. [Acknowledgments](#acknowledgments)  

---

## **Overview**

The backend provides the following functionalities:
- User registration and login with JWT-based authentication.
- CRUD operations for menu management.
- Order placement, tracking, and management.
- Secure API endpoints with authentication and authorization.

---

## **Features**

1. **Authentication**: Secure registration and login with hashed passwords and JWT.
2. **Menu Management**: Add, update, delete, and fetch menu items.
3. **Order Management**: Place orders, view order history, and delete orders.
4. **Error Handling**: Comprehensive error handling for validation and operational errors.

---

## **Technologies Used**

- **Node.js**: Backend runtime.
- **Express.js**: Framework for building RESTful APIs.
- **MongoDB**: NoSQL database for storing data.
- **Mongoose**: MongoDB ODM for schema and model management.
- **JWT**: Token-based authentication.
- **bcrypt.js**: Secure password hashing.
- **dotenv**: Environment variable management.
- **CORS**: Cross-origin resource sharing.

---

## **Setup Instructions**

1. Clone the repository:
   ```bash
   git clone git@github.com:webcrafter011/craft-my-plate-backend.git
   cd craft-my-plate-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and configure it as described below.

4. Start the server:
   ```bash
   npm start
   ```

---

## **Environment Variables**

Create a `.env` file in the root directory and add the following variables:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=your_server_port (default: 5000)
```

---

## **API Documentation**

### **Base URL**
```
http://localhost:5000/ (if running locally)
https://craft-my-plate-backend-w0y6.onrender.com/ (deployed)
```

### **Authentication Routes**

#### 1. **Register User**
- **Endpoint**: `POST /register`
- **Description**: Registers a new user.
- **Request Body**:
  ```json
  {
    "username": "exampleUser",
    "password": "examplePassword"
  }
  ```
- **Response**:
  - **201**: User registered successfully.
  - **400**: Missing fields or username already exists.

#### 2. **Login User**
- **Endpoint**: `POST /login`
- **Description**: Authenticates a user and returns a JWT token.
- **Request Body**:
  ```json
  {
    "username": "exampleUser",
    "password": "examplePassword"
  }
  ```
- **Response**:
  ```json
  {
    "token": "your_jwt_token"
  }
  ```
  - **400**: Invalid credentials.
  - **404**: User not found.

---

### **Menu Routes**

#### 1. **Fetch All Menu Items**
- **Endpoint**: `GET /menu`
- **Description**: Retrieves all menu items.
- **Response**:
  ```json
  [
    {
      "_id": "menuItemId",
      "name": "Pizza",
      "category": "Food",
      "price": 10.99,
      "availability": true
    }
  ]
  ```
  - **404**: No menu items found.

#### 2. **Create Menu Item**
- **Endpoint**: `POST /menu`
- **Description**: Adds a new menu item (authenticated users only).
- **Headers**:
  ```json
  {
    "Authorization": "Bearer your_jwt_token"
  }
  ```
- **Request Body**:
  ```json
  {
    "name": "Burger",
    "category": "Food",
    "price": 5.99,
    "availability": true
  }
  ```
- **Response**:
  - **201**: Menu item created successfully.
  - **400**: Missing fields.

#### 3. **Delete Menu Item**
- **Endpoint**: `DELETE /menu/:id`
- **Description**: Deletes a menu item by ID (authenticated users only).
- **Headers**:
  ```json
  {
    "Authorization": "Bearer your_jwt_token"
  }
  ```
- **Response**:
  - **200**: Menu item deleted successfully.
  - **404**: Menu item not found.
  - **400**: Cannot delete if ordered.

---

### **Order Routes**

#### 1. **Fetch Orders**
- **Endpoint**: `GET /orders`
- **Description**: Fetches orders for the logged-in user.
- **Headers**:
  ```json
  {
    "Authorization": "Bearer your_jwt_token"
  }
  ```
- **Response**:
  ```json
  [
    {
      "_id": "orderId",
      "items": [
        {
          "itemId": "menuItemId",
          "quantity": 2
        }
      ],
      "totalAmount": 20.99,
      "status": "Pending"
    }
  ]
  ```

#### 2. **Place an Order**
- **Endpoint**: `POST /order`
- **Description**: Places a new order (authenticated users only).
- **Headers**:
  ```json
  {
    "Authorization": "Bearer your_jwt_token"
  }
  ```
- **Request Body**:
  ```json
  {
    "items": [
      {
        "itemId": "menuItemId",
        "quantity": 2
      }
    ]
  }
  ```
- **Response**:
  - **201**: Order placed successfully.
  - **400**: Missing or invalid items.

#### 3. **Delete an Order**
- **Endpoint**: `DELETE /order/:id`
- **Description**: Deletes an order by ID (authenticated users only).
- **Headers**:
  ```json
  {
    "Authorization": "Bearer your_jwt_token"
  }
  ```
- **Response**:
  - **200**: Order deleted successfully.
  - **403**: Unauthorized access.
  - **404**: Order not found.

---

## **Testing with Postman**

1. **Set up Postman**: Install Postman and import a new request collection.
2. **Authentication**:
   - Use the `POST /register` and `POST /login` endpoints to create and authenticate a user.
   - Copy the JWT token from the response and use it in the `Authorization` header for all subsequent requests.
3. **Menu Management**:
   - Fetch, add, and delete menu items using their respective endpoints.
   - Provide the token in the `Authorization` header for authenticated routes.
4. **Order Management**:
   - Use the `GET /orders`, `POST /order`, and `DELETE /order/:id` endpoints to manage orders.

---

## **Acknowledgments**

Thank you for reviewing this backend application. Let me know if you have any questions or feedback!
