# Predictive Government Queue Management & Resource Allocation System (TN Smart Queue)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-lightgrey.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-emerald.svg)](https://www.mongodb.com/)

An end-to-end smart queue management and predictive crowd optimization platform designed for public administration and government citizen-service centers (such as Taluk Offices, Regional Transport Offices (RTO), Passport Seva Kendras, and Municipal Corporations).

---

## 📌 Problem Statement

Traditional government service counters frequently suffer from:
* **Severe physical overcrowding** and unpredictable waiting times.
* **Lack of visibility** for citizens regarding queue positions and estimated wait durations.
* **Static resource allocation**, where counter operators are unable to dynamically adapt to peak demand surges.
* **Loss of productive hours** for citizens waiting on-premise without real-time tracking or notifications.

---

## 💡 Solution Overview

**TN Smart Queue** transforms public service delivery into a streamlined, transparent, and data-driven process:
1. **Digital Token Generation**: Citizens can register, select a service and department, and obtain a virtual token before or upon arrival.
2. **Live Queue Tracking**: Dynamic monitoring of active counters, serving numbers, and remaining citizens ahead in line.
3. **Predictive Wait Time Estimation**: Analyzes historical service durations, arrival patterns, active counter capacity, and current queue depth to provide realistic wait estimates.
4. **ML Training Data Pipeline**: Built-in telemetry endpoint that compiles real-world queue metrics (`queueLength`, `activeCounters`, `arrivalHour`, `serviceType`) against actual service times for training predictive machine learning models.
5. **Admin & Counter Operator Dashboard**: Desk staff can call next tokens, update serving status, handle cancellations, and rebalance counter workloads in real time.

---

## 🏛️ System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                   Citizen & Admin Devices                   │
│          (React 18 + Vite + Bootstrap 5 + Axios)            │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST APIs (Port 3000 -> 5000)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Node.js / Express Backend                   │
│  - JWT & Role-Based Access Control (Citizen / Admin)        │
│  - Queue Controller & Token State Machine                   │
│  - Counter Resource Allocator                               │
│  - ML Training Data Aggregation & Telemetry                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       MongoDB Database                      │
│   [Users]   [Offices]   [Services]   [Counters]   [Tokens]  │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 👤 Citizen Portal
- **Secure Authentication**: Simple signup and login with role verification and token persistence.
- **Service & Department Catalog**: Browse available public services (e.g., Passport Renewal, Driving License, Certificate Issuance) with average expected duration indicators.
- **Digital Token Generation**: Generates official token numbers with unique identifier codes and real-time initial queue position.
- **Live Queue Tracking**: Visual progress bar, current token being served at desk, and tokens ahead.
- **Notification Preferences**: Configurable alerts for queue turn reminders.

### 🏢 Admin & Desk Operator Portal
- **Centralized Dashboard**: Live overview of total citizens waiting, currently served, completed, and cancelled.
- **Live Counter Management**: Call Next Token, mark serving, mark completed, or record no-show/cancelled.
- **Multi-Office Support**: Configure multiple offices, operating hours, and dedicated desk counters.
- **Service Configuration**: Define custom services with estimated average handling duration.
- **Analytics & Training Data Export**: Dedicated API to query historical throughput for queueing theory and machine learning regression models.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, React-Bootstrap, Bootstrap 5, React Router v6, Axios, React Icons, React Toastify |
| **Backend** | Node.js, Express.js 4, Mongoose 8, JSON Web Tokens (JWT), Bcrypt.js, Express-Validator |
| **Database** | MongoDB (Local MongoDB Server or MongoDB Atlas) |
| **UI Prototypes**| Stitch HTML5 / CSS responsive screen designs included in `stitch_screens/` |

---

## 📁 Repository Structure

```text
queue-management-system/
├── backend/
│   ├── config/              # MongoDB connection configuration
│   ├── middleware/          # JWT auth & admin authorization middleware
│   ├── models/              # Mongoose schemas (User, Office, Service, Counter, Token)
│   ├── routes/              # Express API route controllers
│   │   ├── authRoutes.js
│   │   ├── officeRoutes.js
│   │   ├── serviceRoutes.js
│   │   ├── counterRoutes.js
│   │   ├── queueRoutes.js
│   │   └── trainingDataRoutes.js
│   ├── utils/               # Token numbering generator & queue utilities
│   ├── .env                 # Environment variables (PORT, MONGO_URI, JWT_SECRET)
│   ├── seed.js              # Database seeder with offices, counters, and synthetic ML data
│   ├── server.js            # Express application entry point
│   └── package.json
│
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components (Navbar, ProtectedRoute, QueueStatsBar, TokenCard)
│   │   ├── context/         # AuthContext for authentication state
│   │   ├── pages/           # Citizen and public pages (Landing, Login, Dashboard, Booking, Token)
│   │   │   └── admin/       # Operator pages (AdminDashboard, AdminQueueManagement)
│   │   ├── services/        # Axios API client with interceptors
│   │   ├── App.jsx          # Route configuration
│   │   ├── App.css          # Theme styles
│   │   └── main.jsx         # React DOM mount point
│   ├── index.html
│   ├── vite.config.js       # Vite build & reverse-proxy configuration
│   └── package.json
│
├── stitch_screens/          # Standalone responsive UI mockups & previews
├── README.md                # Project documentation
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have installed:
* [Node.js](https://nodejs.org/) (v18.x or later)
* [npm](https://www.npmjs.com/) (v9.x or later)
* [MongoDB](https://www.mongodb.com/try/download/community) running locally on port `27017` or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection URI.

---

### 1. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `backend/.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/queue_management_db
   JWT_SECRET=supersecretjwtkey_123
   ```

4. Populate sample data (Offices, Counters, Services, and Synthetic ML records):
   ```bash
   npm run seed
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will be running at [http://localhost:5000](http://localhost:5000).*

---

### 2. Frontend Setup

1. Open another terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will launch at [http://localhost:3000](http://localhost:3000).*

---

## 🔑 Demo Credentials

After running `npm run seed`, you can immediately test the application using the pre-seeded accounts:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin / Desk Operator** | `admin@queue.com` | `admin123` | Full queue management, call next token, system analytics |
| **Citizen (User 1)** | `rahul@example.com` | `citizen123` | Book tokens, track queues, view history |
| **Citizen (User 2)** | `priya@example.com` | `citizen123` | Book tokens, track queues, view history |

*(You can also register a new Citizen account directly through the registration screen.)*

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
* `POST /api/auth/register` - Register a new citizen account
* `POST /api/auth/login` - Authenticate citizen or admin, returns JWT
* `GET /api/auth/me` - Get current authenticated user profile

### Government Offices & Services (`/api/offices`, `/api/services`)
* `GET /api/offices` - List all registered government offices
* `GET /api/offices/:id` - Get details & counters of a specific office
* `GET /api/services?office=:officeId` - List services available at an office

### Queue & Tokens (`/api/queue`)
* `POST /api/queue/book` - Book appointment and generate virtual token
* `GET /api/queue/my-tokens` - Get active and past tokens for current citizen
* `GET /api/queue/status/:officeId` - Public real-time queue status of an office
* `POST /api/queue/call-next` - *(Admin)* Call next waiting token to an active counter
* `PUT /api/queue/status/:tokenId` - *(Admin)* Update token state (`serving`, `completed`, `cancelled`)

### Predictive Analytics & ML Telemetry (`/api/training-data`)
* `GET /api/training-data` - *(Admin)* Export completed token records formatted for Machine Learning
* `GET /api/training-data/stats` - *(Admin)* Aggregate overview of average, minimum, and maximum wait times

---

## 👥 Authors & Acknowledgments

* **Haran M K** ([@Haran-MK](https://github.com/Haran-MK))
* **Harisekaran G** ([@Harisekaran-G](https://github.com/Harisekaran-G))
* Team Predictive Government Queue Management System

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
