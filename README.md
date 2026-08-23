EHMS — Electricity & Energy Management System

EHMS is a full-stack Electricity & Energy Management System with separate Admin and User portals.

The project is built to manage users, electricity meters, bills, payments, and reports from an administrative dashboard while giving customers a secure portal to view their own account information, meters, bills, and payment history.

Project status: Admin and User management features are implemented. Online bill payment is the next planned feature.

Features

Admin Portal

The Admin portal provides centralized management of the EHMS system.

Authentication

Admin login

JWT-based authentication

Role-based route protection

Admin-only access to administrative pages

Dashboard

Admin dashboard

System statistics/count cards

Quick navigation to management sections

User Management

View all users

View individual user details

Create users

Edit users

Delete users

Prevent an administrator from deleting their own account

Role support:

admin

user

Password hashing with bcrypt

Meter Management

View all meters

Add meters

View meter details

Edit meters

Activate/deactivate meters

Delete meters

Assign meters to users

Meter types and installation dates

Duplicate meter-number validation

Bill Management

View bills

Add bills

View bill details

Edit bills

Associate bills with users/meters

Payment Management

View payments

Add payment records

View payment details

Track payment status

Reports

Admin reports section

Designed for system-level reporting and monitoring

User Portal

The User portal is designed so each customer can access only their own information.

Authentication

User login

JWT authentication

User-only protected routes

Logout

Registration

Users can create their own account without an administrator creating it first.

Public registration creates accounts with:

role = user

Users cannot select or create an administrator account through public registration.

User Dashboard

Personalized welcome message

Meter count

Bill count

Payment count

Latest meter information

Latest bill information

Quick navigation cards

Profile

Users can view:

Name

Email

Role

My Meter

Users can view their assigned meters:

Meter number

Meter type

Installation date

Status

My Bills

Users can view their own bills:

Billing month

Units consumed

Amount

Due date

Status

Users can open individual bill details.

My Payments

Users can view their own payment history:

Bill ID

Amount

Payment date

Payment method

Transaction ID

Payment status

Users can open individual payment details.

Data Isolation

User API endpoints use the authenticated user's ID from the JWT rather than trusting a user_id supplied by the frontend.

This prevents a user from simply changing an ID in the URL to access another user's meters, bills, or payments.

Technology Stack

Frontend

React

TypeScript

React Router

Tailwind CSS

Vite

Backend

Node.js

Express

TypeScript

MySQL

bcrypt

JWT authentication

Database

MySQL is used for persistent application data.

The system contains data relationships between:

Users
  │
  ├── Meters
  │
  ├── Bills
  │
  └── Payments

Project Structure

A simplified project structure is:

ECM/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── Database.ts
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── userControllers.ts
│   │   │   ├── meterController.ts
│   │   │   ├── billController.ts
│   │   │   ├── paymentController.ts
│   │   │   ├── registerController.ts
│   │   │   └── userDashboardController.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts
│   │   │   └── roleMiddleware.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── userRoutes.ts
│   │   │   ├── meterRoutes.ts
│   │   │   ├── billRoutes.ts
│   │   │   ├── paymentRoutes.ts
│   │   │   ├── registerRoutes.ts
│   │   │   └── userDashboardRoutes.ts
│   │   │
│   │   └── server.ts
│   │
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   └── user/
│   │   │
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── user/
│   │   │   ├── AdminLogin.tsx
│   │   │   ├── UserLogin.tsx
│   │   │   ├── UserDashboard.tsx
│   │   │   └── UserRegister.tsx
│   │   │
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   └── package.json
│
├── .gitignore
└── README.md

File names may vary slightly depending on the current project version.

Routing

Public Routes

/
 /login
 /admin/login
 /user/login
 /user/register

Admin Routes

All Admin routes are protected by:

<ProtectedRoutes allowedRole="admin">

Main Admin routes:

/admin/dashboard

/admin/users
/admin/users/add
/admin/users/:id
/admin/users/:id/edit

/admin/meters
/admin/meters/add
/admin/meters/:id
/admin/meters/:id/edit

/admin/bills
/admin/bills/add
/admin/bills/:id
/admin/bills/:id/edit

/admin/payments
/admin/payments/add
/admin/payments/:id

/admin/reports

User Routes

All User routes are protected by:

<ProtectedRoutes allowedRole="user">

Main User routes:

/user/dashboard
/user/profile
/user/meters

/user/bills
/user/bills/:id

/user/payments
/user/payments/:id

Backend API

The backend runs on:

http://localhost:5000

Authentication

Authentication endpoints are located under the project's auth routes.

The application uses JWT tokens for authentication.

The token is stored on the frontend and sent with protected API requests:

Authorization: Bearer <token>

Admin User API

GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id

These endpoints require authentication and Admin authorization.

Meter API

GET    /api/meters
GET    /api/meters/:id
POST   /api/meters
PUT    /api/meters/:id
DELETE /api/meters/:id

Admin authorization is required for administrative meter operations.

Bill API

The Bill API supports the administrative bill management functionality.

Typical operations include:

GET
POST
PUT
DELETE

The exact route definitions should be checked in:

backend/src/routes/

Payment API

The Payment API supports payment records and payment management.

Typical operations include:

GET
POST
PUT
DELETE

The exact route definitions should be checked in:

backend/src/routes/

User API

The User-specific API is mounted under:

/api/user

Dashboard

GET /api/user/dashboard

Returns the authenticated user's:

Profile

Meters

Bills

Payments

Profile

GET /api/user/profile

Meters

GET /api/user/meters

Bills

GET /api/user/bills
GET /api/user/bills/:id

Payments

GET /api/user/payments
GET /api/user/payments/:id

All these endpoints use the authenticated user's identity.

User Registration

New users can register through:

/user/register

The backend endpoint is:

POST /api/register

Request:

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

The backend automatically creates the account as:

role = user

Passwords are hashed using bcrypt before being stored.

Database Relationships

The application is centered around the following relationships:

users
  │
  ├───────────────┐
  │               │
  ▼               ▼
meters           bills
  │               │
  │               ▼
  └──────────► payments

A user can have one or more meters.

A user's bills are associated with their meters/user account.

Payments are associated with bills and users.

Security

The application includes several security measures.

Password hashing

Passwords are hashed with:

bcrypt

Authentication

Protected API routes use JWT authentication.

Authorization

Admin routes use role-based authorization.

Example:

authorize("admin")

User data isolation

User endpoints derive the user ID from the authenticated token.

The frontend does not decide which user's data it is allowed to retrieve.

Admin self-delete protection

An administrator cannot delete their own currently logged-in account.

Registration role protection

Public registration cannot create an Admin account.

Environment Variables

Do not commit secret values to GitHub.

The .env file should remain local.

Example backend environment configuration:

PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_database_password
DB_NAME=your_database_name

JWT_SECRET=your_jwt_secret

Use the actual variable names already used by the project's backend configuration.

Installation

1. Clone the repository

git clone https://github.com/Shivam10010/ECM.git
cd ECM

2. Install backend dependencies

cd backend
npm install

3. Configure backend environment

Create:

backend/.env

Add your local MySQL and JWT configuration.

Never commit this file.

4. Start the backend

Use the project's configured development command, for example:

npm run dev

The backend should run on:

http://localhost:5000

5. Install frontend dependencies

Open another terminal:

cd frontend
npm install

6. Start the frontend

npm run dev

Vite will provide the local frontend URL, normally:

http://localhost:5173

Local Testing

Admin

Open:

http://localhost:5173/admin/login

Test:

Login

Dashboard

Users

Add User

View User

Edit User

Delete User

Meters

Add Meter

View Meter

Edit Meter

Activate/Deactivate Meter

Delete Meter

Bills

Payments

Reports

User

Open:

http://localhost:5173/user/login

Test:

Login

Dashboard

Profile

My Meter

My Bills

Bill Details

My Payments

Payment Details

Logout

Also test:

/user/register

to verify that a new user can create an account.

Online Bill Payment

Online bill payment is planned as the next major feature.

The intended payment flow is:

User
 ↓
My Bills
 ↓
Select unpaid bill
 ↓
Pay Bill
 ↓
Secure payment provider
 ↓
Payment confirmation
 ↓
Payment record created
 ↓
Bill marked as paid
 ↓
Payment appears in My Payments

A production payment provider such as Stripe should be used.

Payment secret keys must remain on the backend and must never be exposed in frontend code.

Admin Dashboard Statistics

The Admin Dashboard is designed to provide quick system statistics such as:

Users
Meters
Bills
Payments

The count cards should link to their respective management pages:

Users     → /admin/users
Meters    → /admin/meters
Bills     → /admin/bills
Payments  → /admin/payments

Development Guidelines

When adding new features:

Keep authentication on protected endpoints.

Use role-based authorization for Admin functionality.

Never trust a frontend-supplied user ID for User data.

Validate request bodies on the backend.

Hash passwords before storing them.

Keep secrets in .env.

Do not commit .env to Git.

Keep Admin and User API responsibilities separate.

Test existing features after adding a new feature.

Avoid breaking already-working Admin functionality.

Git Workflow

The project is maintained using Git.

Check status:

git status

Stage changes:

git add .

Commit:

git commit -m "Describe the change"

Push:

git push origin main

The current project repository is:

https://github.com/Shivam10010/ECM

Deployment

Before production deployment:

Configure production environment variables

Configure production MySQL database

Configure CORS

Use HTTPS

Configure frontend API URL

Configure JWT secret

Configure payment provider secrets

Never expose backend secrets

Build the React frontend

Deploy backend API

Deploy frontend

Test authentication and authorization

Test payment callbacks/webhooks

Test database connectivity

The exact deployment platform can be selected after local development and final testing are complete.

Current Development Roadmap

Completed

Admin authentication

User authentication

Protected routes

Role-based authorization

Admin dashboard

User management

Meter management

Bill management

Payment management

Reports section

User registration

User dashboard

User profile

User meter view

User bill view

User bill details

User payment history

User payment details

In Progress / Next

Online bill payment

Payment provider integration

Payment webhook verification

Automatic bill status update after successful payment

Real Admin Dashboard statistics

Clickable Admin Dashboard statistics

Final UI polishing

Production configuration

Deployment

Final end-to-end testing

Project Repository

GitHub:

https://github.com/Shivam10010/ECM

Author

EHMS / ECM Project

Built as a full-stack Electricity & Energy Management System with separate administrative and customer-facing functionality.