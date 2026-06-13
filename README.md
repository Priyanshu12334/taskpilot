# TaskPilot - Collaborative Task Management Platform

TaskPilot is a full-stack MERN application for team collaboration and task management. Admin can create tasks, assign them to team members, track progress, and communicate through real-time team chat.

## Features

* User Authentication (JWT)
* Task Creation and Management
* Task Assignment
* Team Chat using Socket.IO
* Dashboard with Task Statistics
* User Roles and Permissions
* Responsive User Interface

## Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* Axios
* React Router

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Socket.IO

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

* Frontend: https://taskpilot-ivory.vercel.app

* Backend API: https://taskpilot-backend-0lk1.onrender.com

## Default Ports

* Frontend: http://localhost:3000
* Backend: http://localhost:5000

## Author

Priyanshu Suyal

GitHub: https://github.com/Priyanshu12334
 
