# Network Device Management System

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Technologies](https://img.shields.io/badge/tech-MERN%20Stack-orange.svg)

## Table of Contents

- [Network Device Management System](#network-device-management-system)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Features](#features)
  - [Technologies Used](#technologies-used)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Running the Application](#running-the-application)
  - [Environment Variables](#environment-variables)
  - [API Endpoints](#api-endpoints)
    - [Authentication](#authentication)
    - [Users (Admin Only)](#users-admin-only)
    - [Devices](#devices)
    - [Configurations](#configurations)
  - [Frontend Routes](#frontend-routes)
  - [Socket.IO Events](#socketio-events)
  - [User Roles & Authorization](#user-roles--authorization)
  - [Project Structure](#project-structure)
  - [Contributing](#contributing)
  - [License](#license)
  - [Contact](#contact)

## Overview

The **Network Device Management System** is a full-stack web application designed to simplify the monitoring and configuration of network devices. Its primary purpose is to provide administrators and authorized users with a centralized platform to:

* **Manage Devices**: Add, update, and track network devices.
* **Handle Configurations**: Create, store, and deploy configurations for each device.
* **Monitor Status**: View real-time online/offline status and ping latency of devices.

Built with the **MERN stack (MongoDB, Express.js, React, Node.js)** and enhanced with **Socket.IO** for real-time updates, this system streamlines network asset management through a user-friendly interface and robust authentication.

## Features

* **User Authentication & Authorization**:
    * Secure user registration and login.
    * JWT-based authentication for API access.
    * Role-based access control (RBAC) with `admin`, `user`, and `viewer` roles.
* **Device Management**:
    * Add, view, update, and delete network devices.
    * Store device details like name, type, IP address, location, and description.
* **Configuration Management**:
    * Create multiple configurations for each device.
    * View historical configurations for a device.
    * Set a specific configuration as the current active configuration for a device.
* **Real-time Device Status Monitoring**:
    * Automated background pinging of devices every 5 minutes to check their online/offline status and latency.
    * Real-time updates to the frontend using Socket.IO when a device's status changes.
* **Responsive Frontend**:
    * User-friendly interface built with React.
* **Robust Backend**:
    * RESTful API design with Express.js.
    * MongoDB for data storage.
    * Asynchronous error handling middleware.

## Technologies Used

* **Frontend**:
    * React.js
    * React Router DOM
    * Axios (for API calls)
    * Socket.IO Client
* **Backend**:
    * Node.js
    * Express.js
    * MongoDB (with Mongoose ODM)
    * Bcrypt.js (for password hashing)
    * JSON Web Token (JWT)
    * Dotenv (for environment variables)
    * Socket.IO
    * Node-cron (for scheduled tasks)
    * Ping (for device reachability checks)
    * Express-async-handler (for simplifying async middleware error handling)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed:

* **Node.js**: [https://nodejs.org/](https://nodejs.org/) (LTS version recommended)
* **npm** (comes with Node.js) or **Yarn**
* **MongoDB**: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community) (Make sure MongoDB is running, typically on `mongodb://localhost:27017`)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd network-device-management-system
    ```

2.  **Install backend dependencies:**
    ```bash
    cd server
    npm install
    # OR
    # yarn install
    ```

3.  **Install frontend dependencies:**
    ```bash
    cd ../client
    npm install
    # OR
    # yarn install
    ```

### Running the Application

1.  **Set up environment variables:**
    * Create a `.env` file in the `server` directory.
    * Create a `.env` file in the `client` directory.
    * Refer to the [Environment Variables](#environment-variables) section for required variables.

2.  **Start the MongoDB server:**
    Ensure your MongoDB instance is running.

3.  **Start the backend server:**
    ```bash
    cd server
    npm start
    # OR
    # yarn start
    ```
    The server should start on `http://localhost:5000` (or your specified `PORT`). You should see messages indicating MongoDB connection and server listening.

4.  **Start the frontend development server:**
    ```bash
    cd ../client
    npm run dev
    # OR
    # yarn dev
    ```
    The React app should open in your browser, typically on `http://localhost:5173`.

You should now have both the frontend and backend running, and the application should be fully functional.

## Environment Variables

### `server/.env`

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/network-db
JWT_SECRET=supersecretjwtkey
CLIENT_URL=http://localhost:5173