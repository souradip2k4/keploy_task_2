# **Backend API Service for User Authentication**

This repository contains the backend service for a modern web application, built with Node.js, Express.js, and MongoDB. It provides a complete RESTful API for user registration, login, authentication, and profile management, including features like JWT-based security, cookie handling, and integration with Cloudinary for file uploads.

## **✨ Features**

* **User Authentication**: Secure user registration and login with password hashing (using bcrypt).  
* **JWT & Refresh Tokens**: Implements JSON Web Tokens (JWT) for securing API endpoints, along with a refresh token mechanism for persistent sessions.  
* **Cookie-Based Sessions**: Stores access and refresh tokens in secure, HTTP-only cookies.  
* **CRUD Operations**: Full support for creating, reading, updating, and deleting user data.  
* **File Uploads**: Integrated with Cloudinary for seamless avatar and cover image uploads.  
* **Middleware-Driven**: Uses custom middleware for handling asynchronous operations, error management, and authentication checks.  
* **Scalable Structure**: Organized into controllers, routes, models, and utility folders for maintainability.  
* **Detailed API Responses**: Provides consistent and informative JSON responses using a custom ApiResponse class.

## **🛠️ Tech Stack**

* **Node.js**: JavaScript runtime environment.  
* **Express.js**: Web framework for Node.js.  
* **MongoDB**: NoSQL database for storing user data.  
* **Mongoose**: Object Data Modeling (ODM) library for MongoDB.  
* **JSON Web Token (JWT)**: For generating and verifying access and refresh tokens.  
* **Cloudinary**: Cloud-based service for image management and storage.  
* **Multer**: Middleware for handling multipart/form-data, used for file uploads.  
* **bcrypt**: Library for hashing passwords.  
* **cookie-parser**: Middleware to parse Cookie header and populate req.cookies.

## **🚀 Getting Started**

Follow these instructions to get a local copy up and running.

### **Prerequisites**

* [Node.js](https://nodejs.org/en/) (v18.x or later recommended)  
* [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)  
* [MongoDB](https://www.mongodb.com/try/download/community) instance (local or a cloud service like MongoDB Atlas)  
* A [Cloudinary](https://cloudinary.com/) account for API keys.

### **Installation**

1. **Clone the repository:**  
   git clone https://your-repository-url.com/  
   cd \<project-folder\>

2. **Install dependencies:**  
   npm install

   or  
   yarn install

3. Set up Environment Variables:  
   Create a .env file in the root of your project and add the following variables. Replace the placeholder values with your actual configuration details.  
   \# Port for the server to run on  
   PORT=8000

   \# MongoDB connection string  
   MONGODB\_URI=mongodb+srv://\<user\>:\<password\>@cluster.mongodb.net/\<database\_name\>

   \# CORS origin URL for your frontend application  
   CORS\_ORIGIN=http://localhost:3000

   \# JWT Secrets and Expiry  
   ACCESS\_TOKEN\_SECRET=your-strong-access-token-secret  
   ACCESS\_TOKEN\_EXPIRY=1d  
   REFRESH\_TOKEN\_SECRET=your-strong-refresh-token-secret  
   REFRESH\_TOKEN\_EXPIRY=10d

   \# Cloudinary Credentials  
   CLOUDINARY\_CLOUD\_NAME=your\_cloud\_name  
   CLOUDINARY\_API\_KEY=your\_api\_key  
   CLOUDINARY\_API\_SECRET=your\_api\_secret

### **Running the Application**

* To start the server in development mode, run:  
  npm run dev

  or  
  yarn dev

* The server will start on the port specified in your .env file (e.g., http://localhost:8000).

## **📂 Project Structure**

.  
├── src/  
│   ├── controllers/      \# Request handlers and business logic  
│   │   └── user.controller.js  
│   ├── db/               \# Database connection logic  
│   │   └── index.js  
│   ├── middlewares/      \# Custom Express middlewares  
│   │   ├── auth.middleware.js  
│   │   └── multer.middleware.js  
│   ├── models/           \# Mongoose models (database schemas)  
│   │   └── users.model.js  
│   ├── routes/           \# API routes definition  
│   │   └── user.routes.js  
│   ├── utils/            \# Utility functions and classes  
│   │   ├── ApiError.js  
│   │   ├── ApiResponse.js  
│   │   ├── AsyncHandler.js  
│   │   └── cloudinary.js  
│   ├── app.js            \# Main Express application setup  
│   ├── constants.js      \# Project constants  
│   └── index.js          \# Entry point of the application  
├── .env                  \# Environment variables (not committed)  
├── .gitignore  
├── package.json  
└── README.md

## **📖 API Documentation**

All endpoints are prefixed with /api/v1/users.

### **Authentication Endpoints**

#### **POST /register**

Registers a new user. This is a multipart/form-data endpoint.

* **Authentication**: None  
* **Request Body (form-data)**:  
  * fullName (string, required)  
  * username (string, required)  
  * email (string, required)  
  * password (string, required)  
  * avatar (file, required)  
  * coverImage (file, optional)  
* **Success Response (200 OK)**:  
  {  
      "statusCode": 200,  
      "data": {  
          "\_id": "60d5f4f8e6a1e3b4e8f1b1a0",  
          "fullName": "John Doe",  
          "email": "john.doe@example.com",  
          "username": "johndoe",  
          "avatar": "http://res.cloudinary.com/demo/image/upload/avatar.jpg",  
          "coverImage": "http://res.cloudinary.com/demo/image/upload/cover.jpg"  
      },  
      "message": "User registered Successfully",  
      "success": true  
  }

#### **POST /login**

Logs in an existing user and returns access and refresh tokens in cookies.

* **Authentication**: None  
* **Request Body (json)**:  
  {  
      "email": "john.doe@example.com",  
      "password": "password123"  
  }

  *(You can use username instead of email)*  
* **Success Response (200 OK)**:  
  * Sets accessToken and refreshToken in HttpOnly cookies.  
  * JSON Body:  
    {  
        "statusCode": 200,  
        "data": {  
            "user": {  
                "\_id": "60d5f4f8e6a1e3b4e8f1b1a0",  
                "fullName": "John Doe",  
                "email": "john.doe@example.com",  
                "username": "johndoe"  
            },  
            "accessToken": "...",  
            "refreshToken": "..."  
        },  
        "message": "User logged in successfully",  
        "success": true  
    }

#### **GET /logout**

Logs out the current user by clearing their refresh token from the database and clearing cookies.

* **Authentication**: accessToken required  
* **Success Response (200 OK)**:  
  * Clears accessToken and refreshToken cookies.  
  * JSON Body:  
    {  
        "statusCode": 200,  
        "data": {},  
        "message": "User logged out successfully",  
        "success": true  
    }

#### **POST /refresh-token**

Generates a new pair of access and refresh tokens using a valid refresh token.

* **Authentication**: None  
* **Request Body (json)**:  
  {  
      "refreshToken": "your-refresh-token-here"  
  }

  *(Note: The refresh token is first checked from cookies, so this body is a fallback)*  
* **Success Response (200 OK)**:  
  * Sets new accessToken and refreshToken in HttpOnly cookies.  
  * JSON Body:  
    {  
        "statusCode": 200,  
        "data": {  
            "accessToken": "...",  
            "refreshToken": "..."  
        },  
        "message": "accessToken refreshed successfully",  
        "success": true  
    }

### **User Management Endpoints**

*All endpoints below require a valid accessToken.*

#### **POST /get-user**

Fetches details of the currently logged-in user.

* **Authentication**: accessToken required  
* **Success Response (200 OK)**:  
  {  
      "statusCode": 200,  
      "data": {  
          "user": {  
              "\_id": "60d5f4f8e6a1e3b4e8f1b1a0",  
              "fullName": "John Doe",  
              ...  
          }  
      },  
      "message": "Fetched current user",  
      "success": true  
  }

#### **POST /change-password**

Changes the password for the current user.

* **Authentication**: accessToken required  
* **Request Body (json)**:  
  {  
      "oldPassword": "password123",  
      "newPassword": "newpassword456"  
  }

* **Success Response (200 OK)**:  
  {  
      "statusCode": 200,  
      "data": {},  
      "message": "Password updated successfully",  
      "success": true  
  }

#### **PATCH /update-account**

Updates the full name and email of the current user.

* **Authentication**: accessToken required  
* **Request Body (json)**:  
  {  
      "fullName": "Johnathan Doe",  
      "email": "johnathan.doe@example.com",  
      "password": "password123"   
  }

  *(Note: The current password is required for validation)*  
* **Success Response (200 OK)**:  
  {  
      "statusCode": 200,  
      "data": {  
          "updatedUser": {  
              "\_id": "60d5f4f8e6a1e3b4e8f1b1a0",  
              "fullName": "Johnathan Doe",  
              "email": "johnathan.doe@example.com",  
              ...  
          }  
      },  
      "message": "Account details updated successfully",  
      "success": true  
  }

#### **PATCH /update-avatar**

Updates the avatar of the current user. Deletes the old avatar from Cloudinary.

* **Authentication**: accessToken required  
* **Request Body (form-data)**:  
  * avatar (file, required)  
* **Success Response (200 OK)**:  
  {  
      "statusCode": 200,  
      "data": {  
          "user": {  
              "\_id": "...",  
              "avatar": "http://res.cloudinary.com/demo/image/upload/new\_avatar.jpg",  
              ...  
          }  
      },  
      "message": "Updated avatar image successfully",  
      "success": true  
  }

#### **PATCH /update-cover-image**

Updates the cover image of the current user.

* **Authentication**: accessToken required  
* **Request Body (form-data)**:  
  * coverImage (file, required)  
* **Success Response (200 OK)**:  
  {  
      "statusCode": 200,  
      "data": {  
          "user": {  
              "\_id": "...",  
              "coverImage": "http://res.cloudinary.com/demo/image/upload/new\_cover.jpg",  
              ...  
          }  
      },  
      "message": "Updated cover image successfully",  
      "success": true  
  }  
