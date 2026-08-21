# TaskFlow

A full-stack to-do application built for local development and project submission. It uses React + Vite on the frontend and Express + SQLite + JWT on the backend.

## Features
- Register and login with securely hashed passwords
- JWT authentication
- User-specific task data
- Create, complete, search, filter and delete tasks
- Priority and due dates
- Dashboard completion statistics
- Responsive modern UI with animations
- SQLite persistence
- REST API

## Requirements
- Node.js 18+
- npm

## Run in VS Code
```bash
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and the API runs at `http://localhost:3000`.

If Windows PowerShell blocks npm scripts, run the commands from the VS Code terminal after installing Node.js, or use Command Prompt.

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

## Security note
The development JWT fallback secret is intended for local coursework only. Set `JWT_SECRET` to a long random value for any real deployment.

## Project structure
```text
src/                 React frontend
server/index.js      Express API + SQLite database
index.html           Vite entry
package.json         Dependencies and scripts
vite.config.js       Vite configuration
```
