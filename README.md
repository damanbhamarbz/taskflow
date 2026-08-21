# TaskFlow

A modern full-stack to-do application built for local development and college project submission.

## Stack
- React + Vite + JavaScript
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- bcrypt password hashing
- Responsive CSS animations

## Features
- Register and login
- Secure password hashing
- JWT authentication
- User-specific tasks
- Create, complete and delete tasks
- Search and filters
- Low/medium/high priority
- Due dates
- Completion dashboard
- Responsive animated interface
- MongoDB persistence
- REST API

## Requirements
- Node.js 18+
- npm
- MongoDB Atlas account/database

## Setup in VS Code

1. Clone the repository:
```bash
git clone https://github.com/damanbhamarbz/taskflow.git
cd taskflow
```

2. Install packages:
```bash
npm install
```

3. Create `.env` in the project root by copying `.env.example`.

4. Put your MongoDB Atlas connection string in `.env`:
```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/taskflow?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-long-random-secret
PORT=3000
```

5. Start the application:
```bash
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:3000`

## MongoDB Atlas
Create a free MongoDB Atlas cluster, create a database user, allow your development IP address in Network Access, then copy the connection string into `.env`.

Never commit `.env` or your database password to GitHub.

## Production build
```bash
npm run build
npm start
```

## API
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/me`
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `GET /api/health`

## Project structure
```text
src/                 React frontend
server/index.js      Express + Mongoose API
index.html           Vite entry
package.json         Dependencies and scripts
vite.config.js       Vite configuration
.env.example         MongoDB/JWT configuration template
```
