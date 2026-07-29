# TaskPilot - Collaborative Task Management Platform

TaskPilot is a full-stack MERN application for team collaboration and task management. Admin can create tasks, assign them to team members, track progress, and communicate through real-time team chat.

## Features

* 🔐 Secure Authentication & Authorization using JWT
* 👥 Role-Based Access Control (Admin, Pending User, Team Member)
* ✅ Admin Approval System for New User Registration
* 📋 Task Creation, Assignment & Management (Admin Only)
* 👨‍💻 Team Members can View, Update and Complete Assigned Tasks
* 💬 Realtime Team Chat powered by Socket.IO
* 🔔 Realtime Notifications for Task Assignments and Updates
* 📊 Dashboard with Task Statistics & Weekly Task Activity Analytics
* 👤 User Profile Management
* 📱 Fully Responsive Design for Desktop, Tablet & Mobile
* ⚡ Fast and Modern User Experience

## Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* Axios
* React Router
* Recharts

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Socket.IO

### DevOps & Deployment
* Docker
* Docker Compose
* Vercel
* Render

## Project Structure

```text
TEAM/
├── client/
├── server/
├── docker-compose.yml
└── README.md
```

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd TEAM
```

### Install Dependencies

Frontend:

```bash
cd client
npm install
```

Backend:

```bash
cd server
npm install
```

## Environment Variables

Create a `.env` file inside the `server` folder and add the required environment variables.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

## Run Locally

Backend:

```bash
cd server
npm start
```

Frontend:

```bash
cd client
npm run dev
```

## Run with Docker

Build and start all services:

```bash
docker compose up --build
```

Stop all services:

```bash
docker compose down
```

## Live Demo

* Live Demo: https://taskpilot-ivory.vercel.app


## Default Ports

* Frontend: http://localhost:3000
* Backend: http://localhost:5000

## Author

Priyanshu Suyal

GitHub: https://github.com/Priyanshu12334
 
