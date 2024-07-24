# BorrWow

Welcome to the BorrWow project! This README provides an overview of the project, including its purpose, structure, and development guidelines.

## Overview

BorrWow is a web application where users can list items they are willing to lend, browse items listed by others, and make requests to borrow these items. Users gain trust points for successful borrowings, enhancing their credibility within the platform. The application includes user authentication, private routes on the frontend, and protected routes on the backend.

## Features

### User Authentication

- **User Registration and Login:** Secure authentication using password hashing and JWT.
- **Private Routes:** Frontend routes accessible only to authenticated users.

### Item Management

- **List Items:** Users can list items they are willing to lend.
- **View Items:** Browse available items and view detailed information about each item.

### Borrowing Request Management

- **Request to Borrow:** Users can request to borrow available items.
- **Request History:** Users can view and manage their borrowing requests.
- **Lender Management:** Lenders can accept or reject borrowing requests.
- **Trust Points:** Both lender and borrower receive trust points upon successful borrowing.

## Models and Relationships

### User Model

- **Fields:** `username`, `email`, `password`, `trustPoints`, etc.
- **Relationships:** Can be an owner (with multiple items listed) and a borrower (with multiple borrowing requests).

### Item Model

- **Fields:** `title`, `description`, `category`, `location`, `owner` (user reference), etc.
- **Relationships:** Belongs to one user, can have multiple borrowing requests.

### BorrowingRequest Model

- **Fields:** `item` (item reference), `borrower` (user reference), `requestDate`, `status` (pending, accepted, rejected, completed), etc.
- **Relationships:** Belongs to one item, belongs to one user.

## API Endpoints

### User Authentication

- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Authenticate a user and return a JWT.

### Items

- `GET /api/items`: Get all items.
- `POST /api/items`: Create a new item listing.
- `GET /api/items/:id`: Get a specific item listing by ID.
- `PUT /api/items/:id`: Update an item listing by ID.
- `DELETE /api/items/:id`: Delete an item listing by ID.

### Borrowing Requests

- `GET /api/requests`: Get all borrowing requests for the authenticated user.
- `POST /api/requests`: Create a new borrowing request.
- `GET /api/requests/:id`: Get a specific borrowing request by ID.
- `PUT /api/requests/:id`: Update a borrowing request by ID (e.g., change status to accepted/rejected/completed).
- `DELETE /api/requests/:id`: Delete a borrowing request by ID.

## Implementation Details

### Backend (Node.js, Express, MongoDB)

- Set up Express server with routes for user authentication, items, and borrowing requests.
- Use Mongoose for MongoDB models and relationships.
- Implement middleware for JWT authentication to protect routes.

### Frontend (React)

- Set up React with routing and state management (e.g., Redux or Context API).
- Create components for user registration, login, item creation, browsing items, and borrowing request management.
- Implement private routes that check for authentication before allowing access to item and borrowing request management features.

### Authentication

- Use bcrypt for password hashing.
- Use JSON Web Tokens (JWT) for authentication and protecting API routes.
- Implement login and registration forms on the frontend.

### Relationships Handling

- Ensure that when an item listing is deleted, associated borrowing requests are also deleted.
- When fetching borrowing requests, include user and item information for each request.

### Trust Points System

- Implement a system for awarding trust points to both lender and borrower upon successful completion of a borrowing request.
- Allow users to view their trust points on their profile.

### Request Management

- Implement a system for lenders to accept or reject borrowing requests.
- Allow users to view and manage their borrowing requests, including status updates.

This project provides experience in managing user authentication, setting up protected routes, handling complex relationships between models, and creating a user-friendly full-stack application using the MERN stack.

## Links

- [Frontend Repository](https://github.com/hannakayes/frontend_borrWow)
- [Backend Repository](https://github.com/mariamagneu/backend_borrWow)
- [Trello Board](https://trello.com/b/jfamD4u0/where-is-my-bird)
