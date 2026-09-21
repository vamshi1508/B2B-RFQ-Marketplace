# B2B RFQ Marketplace

A full-stack B2B Request for Quotation (RFQ) Marketplace that connects buyers and suppliers through a digital procurement workflow.

Buyers can create and manage RFQs, while suppliers can view available RFQs and submit quotations. Buyers can then review quotations and manage the procurement process.

## Live Demo

[Open B2B RFQ Marketplace](https://b2b-rfq-marketplace-1-p7cz.onrender.com)



## Features

### Buyer Features

- User registration and login
- Secure JWT-based authentication
- Buyer dashboard
- Create new RFQs
- View and manage personal RFQs
- Track RFQ status
- View supplier quotations
- Compare supplier quotations
- Award quotations to suppliers

### Supplier Features

- Supplier registration and login
- Secure JWT-based authentication
- Supplier dashboard
- View available RFQs
- View individual RFQ details
- Submit quotations for RFQs
- Manage submitted quotations

### System Features

- Role-based access control
- RESTful API architecture
- MySQL database integration
- Protected API routes
- Buyer and Supplier role separation
- Production deployment using Render
- Cloud MySQL database using Aiven

## Tech Stack

### Frontend

- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- Axios
- React Router

### Backend

- Node.js
- Express.js
- JavaScript
- REST APIs
- JWT Authentication
- bcrypt

### Database

- MySQL 8
- Aiven MySQL

### Deployment

- Render — Frontend
- Render — Backend
- Aiven — Cloud Database

### Development Tools

- Git
- GitHub
- VS Code

## Project Architecture

The application follows a three-layer architecture:

```text
                    B2B RFQ Marketplace
                           │
                           ▼
                ┌─────────────────────┐
                │      Frontend       │
                │   React + Vite      │
                │                     │
                │  Buyer / Supplier   │
                │      Portals        │
                └──────────┬──────────┘
                           │
                     REST API / HTTPS
                           │
                           ▼
                ┌─────────────────────┐
                │       Backend       │
                │   Node.js + Express │
                │                     │
                │ Authentication      │
                │ Authorization       │
                │ RFQ Management      │
                │ Quotation Management│
                └──────────┬──────────┘
                           │
                       MySQL / SSL
                           │
                           ▼
                ┌─────────────────────┐
                │      Database       │
                │    Aiven MySQL      │
                │                     │
                │ Users               │
                │ RFQs                │
                │ Quotations          │
                └─────────────────────┘


##Deployment Architecture
User
 │
 ▼
Render Static Site
React + Vite
 │
 │ HTTPS
 ▼
Render Web Service
Node.js + Express
 │
 │ MySQL + SSL
 ▼
Aiven Cloud MySQL

## Project Structure

```text
B2B-RFQ-Marketplace/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── server.js
│   │
│   ├── ca.pem
│   ├── package.json
│   └── ...
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   │
│   ├── dist/
│   ├── package.json
│   └── ...
│
└── README.md
```

> `node_modules` and generated build files are excluded from the documented source structure because they are generated dependencies/build artifacts.

### Backend

The backend provides the REST API using Node.js and Express.js. It handles authentication, authorization, RFQ management, quotation management, and MySQL database connectivity.

### Frontend

The frontend is built with React and Vite. It provides the Buyer and Supplier portals, authentication pages, RFQ management, and quotation-related user interfaces.

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate an existing user |

### RFQs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/rfqs` | Buyer | Create a new RFQ |
| GET | `/api/rfqs/my` | Buyer | Get buyer's RFQs |
| GET | `/api/rfqs` | Supplier | Get available RFQs |
| GET | `/api/rfqs/:id` | Authenticated User | Get a specific RFQ |

### System

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Check whether the API is running |
| GET | `/api/test-db` | Test database connectivity |

### Quotations

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/quotations` | Supplier | Submit a quotation |
| GET | `/api/quotations/rfq/:rfq_id` | Buyer | Get quotations for a specific RFQ |
| GET | `/api/quotations/my` | Supplier | Get supplier's quotations |
| PUT | `/api/quotations/:quotation_id/accept` | Buyer | Accept a quotation |

## Application Workflow

### Buyer Workflow

1. Register or log in as a Buyer.
2. Create an RFQ with product, quantity, delivery location, and deadline.
3. View and manage created RFQs from the Buyer Dashboard.
4. Monitor the RFQ status.
5. Review quotations submitted by suppliers.
6. Compare supplier quotations.
7. Accept a quotation and award the RFQ.

### Supplier Workflow

1. Register or log in as a Supplier.
2. View available RFQs.
3. Open an RFQ to view its details.
4. Submit a quotation for an RFQ.
5. View submitted quotations from the Supplier Dashboard.
6. Track quotation status.

### Authentication Flow

```text
User
  │
  ▼
Register / Login
  │
  ▼
JWT Token Generated
  │
  ▼
Token Stored by Frontend
  │
  ▼
Authorization Header
  │
  ▼
Backend Authentication Middleware
  │
  ▼
Role-Based Authorization
  │
  ├───────────────┐
  ▼               ▼
BUYER           SUPPLIER
  │               │
  ▼               ▼
Buyer APIs      Supplier APIs

## Security

- JWT is used for user authentication.
- Passwords are securely hashed using bcrypt.
- Role-based authorization separates Buyer and Supplier access.
- Protected API endpoints require authentication.
- Database connections use SSL/TLS in production.
- Sensitive environment variables are stored outside the source code.
- `.env` files and dependency folders are excluded from Git using `.gitignore`.

## Deployment

The application is deployed as separate frontend and backend services.

### Frontend

- Platform: Render Static Site
- Framework: React + Vite
- Production URL: https://b2b-rfq-marketplace-1-p7cz.onrender.com

### Backend

- Platform: Render Web Service
- Runtime: Node.js + Express
- REST API
- Production database connection configured through environment variables

### Database

- Platform: Aiven
- Database: MySQL
- Production connection secured using SSL/TLS



