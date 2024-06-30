# My Supermarket App

My Supermarket is a web application developed with Django for the backend and React for the frontend. The application allows users to browse products, add items to their cart, place orders, and leave reviews on products.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)

## Features

- **User Management**: Registration, login, and profile update.
- **Product Management**: Display products, add, update, and delete (admin only).
- **Shopping Cart**: Add products to cart, update quantities, remove items from cart.
- **Order Placement**: Place orders and view past orders.
- **Product Reviews**: Add and view reviews on products.
- **Payment Integration**: PayPal integration for online payments.

## Prerequisites

Before you begin, ensure you have the following:

- Python 3.x installed
- Node.js and npm installed


## Installation

### Backend (Django)

1. **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd <your-repo-directory>
    ```

2. **Create and activate a virtual environment:**
    ```bash
    python -m venv env
    source env/bin/activate  # On Windows use `env\Scripts\activate`
    ```

3. **Install the dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4. **Apply migrations:**
    ```bash
    python manage.py migrate
    ```

5. **Create a superuser:**
    ```bash
    python manage.py createsuperuser
    ```

6. **Run the development server:**
    ```bash
    python manage.py runserver
    ```

### Frontend (React)

1. **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2. **Install the dependencies:**
    ```bash
    npm install
    ```

3. **Run the development server:**
    ```bash
    npm start
    ```

## Usage

### Running the Application

- Ensure the backend server is running on `http://127.0.0.1:8000`
- Ensure the frontend server is running on `http://localhost:3000`
- Open a browser and navigate to `http://localhost:3000` to use the application.


## Additional Information

- **User Management**: Users can register, log in, and update their profile information. Authentication is handled using JWT tokens.
- **Product Management**: Admin users can add, update, and delete products. Regular users can only view products and add them to their cart.
- **Order Management**: Users can place orders for the items in their cart. Orders are saved with user information and order details.
- **Reviews**: Users can leave reviews and ratings on products they have purchased.

---

This README provides a comprehensive overview of the My Supermarket application, detailing its features, installation steps, usage, deployment with Docker, and project structure.


