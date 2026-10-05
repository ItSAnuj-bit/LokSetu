# LokSetu

> A multi-portal citizen service platform connecting citizens, field workers, and administrators through a unified digital system.

## Overview

**LokSetu** is a multi-portal web platform designed to provide different interfaces for citizens, field workers, and administrators.

The project consists of:

- Citizen Portal
- Field Worker Portal
- Admin Portal
- Portal Selector
- AI/Backend Engine

Each frontend runs independently while communicating with the backend service.

---

# Architecture

```text
                         ┌─────────────────────┐
                         │   Portal Selector    │
                         │     Port: 5176      │
                         └──────────┬──────────┘
                                    │
                  ┌─────────────────┼─────────────────┐
                  │                 │                 │
                  ▼                 ▼                 ▼
        ┌─────────────────┐ ┌───────────────┐ ┌─────────────────┐
        │ Citizen Portal  │ │ Worker Portal │ │  Admin Portal   │
        │   Port: 5173   │ │  Port: 5174  │ │   Port: 5175   │
        └────────┬────────┘ └───────┬───────┘ └────────┬────────┘
                 │                  │                  │
                 └──────────────────┼──────────────────┘
                                    ▼
                         ┌─────────────────────┐
                         │    AI / Backend     │
                         │     Port: 8000      │
                         │      FastAPI        │
                         └─────────────────────┘
```

---

# Project Structure

```text
LokSetu/
│
├── ai-engine/
│   ├── .venv/
│   ├── main.py
│   └── ...
│
├── frontend/
│   ├── package.json
│   ├── src/
│   └── ...
│
├── worker-frontend/
│   ├── package.json
│   ├── src/
│   └── ...
│
├── admin-frontend/
│   ├── package.json
│   ├── src/
│   └── ...
│
├── portal-selector/
│   ├── package.json
│   ├── src/
│   └── ...
│
├── README.md
└── ...
```

---

# Port Configuration

| Component           |   Port | URL                     |
| ------------------- | -----: | ----------------------- |
| Backend / AI Engine | `8000` | `http://127.0.0.1:8000` |
| Citizen Portal      | `5173` | `http://localhost:5173` |
| Worker Portal       | `5174` | `http://localhost:5174` |
| Admin Portal        | `5175` | `http://localhost:5175` |
| Portal Selector     | `5176` | `http://localhost:5176` |

---

# Requirements

Before running LokSetu, install:

- Node.js
- npm
- Python
- Git

Verify the installations:

```powershell
node --version
npm --version
python --version
git --version
```

---

# Installation

## 1. Clone the Repository

```powershell
git clone https://github.com/ItSAnuj-bit/LokSetu.git
```

Move into the directory where the repository was cloned.

For example:

```powershell
cd C:\LokSetu
```

> Replace `C:\LokSetu` with the actual location where you cloned the project.

---

# Backend Setup

The backend is located inside:

```text
ai-engine/
```

The backend uses **FastAPI** and runs on port `8000`.

If the Python virtual environment has not already been created:

```powershell
cd C:\LokSetu\ai-engine

python -m venv .venv
```

Activate the environment:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the required Python dependencies:

```powershell
pip install -r requirements.txt
```

Start the backend:

```powershell
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Backend URL:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

---

# Frontend Setup

Each portal is a separate frontend application.

Install dependencies inside each frontend directory before starting it:

```powershell
npm install
```

---

# Running the Complete Demo

LokSetu requires **five running processes** for the complete demonstration.

Open **five separate PowerShell windows**.

## 1. Start Backend

### PowerShell Window 1

```powershell
cd C:\LokSetu\ai-engine
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Backend:

```text
http://127.0.0.1:8000
```

---

## 2. Start Citizen Portal

### PowerShell Window 2

```powershell
cd C:\LokSetu\frontend
npm install
npm run dev -- --port 5173
```

Citizen Portal:

```text
http://localhost:5173
```

---

## 3. Start Worker Portal

### PowerShell Window 3

```powershell
cd C:\LokSetu\worker-frontend
npm install
npm run dev -- --port 5174
```

Worker Portal:

```text
http://localhost:5174
```

---

## 4. Start Admin Portal

### PowerShell Window 4

```powershell
cd C:\LokSetu\admin-frontend
npm install
npm run dev -- --port 5175
```

Admin Portal:

```text
http://localhost:5175
```

---

## 5. Start Portal Selector

### PowerShell Window 5

```powershell
cd C:\LokSetu\portal-selector
npm install
npm run dev -- --port 5176
```

Main Demo URL:

```text
http://localhost:5176
```

---

# Main Demo

Once all five services are running, open:

**http://localhost:5176**

The Portal Selector provides access to:

```text
                    LokSetu
                       │
          ┌────────────┼────────────┐
          │            │            │
       Citizen       Worker       Admin
          │            │            │
        5173         5174         5175
```

You can also access each portal directly:

| Portal   | URL                   |
| -------- | --------------------- |
| Citizen  | http://localhost:5173 |
| Worker   | http://localhost:5174 |
| Admin    | http://localhost:5175 |
| Selector | http://localhost:5176 |

---

# Demo Accounts

The project contains demo accounts for different roles.

| Role         | Email                         |
| ------------ | ----------------------------- |
| Admin        | `loksetu.admin@gmail.com`     |
| Field Worker | `field.worker.2026@gmail.com` |
| Citizen      | `testcitizen123@gmail.com`    |

> **Security:** Do not commit real passwords, API keys, tokens, or other secrets to the GitHub repository. Use environment variables for credentials.

---

# Testing the Backend

FastAPI provides an interactive API documentation interface.

After starting the backend, open:

```text
http://127.0.0.1:8000/docs
```

This allows developers to inspect and test the available API endpoints.

---

# Troubleshooting

## Port Already in Use

If you see an error indicating that a port is already in use, do not start another copy of the same application.

Stop the existing process first.

You can also find the process using a port with:

```powershell
netstat -ano | findstr :5173
```

Replace `5173` with the required port.

Then stop the corresponding process if necessary.

---

## PowerShell Does Not Allow Virtual Environment Activation

If PowerShell blocks:

```powershell
.\.venv\Scripts\Activate.ps1
```

you may need to adjust the execution policy for your user account:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then activate the environment again:

```powershell
.\.venv\Scripts\Activate.ps1
```

---

## Dependencies Are Missing

For a frontend:

```powershell
npm install
```

For the Python backend:

```powershell
pip install -r requirements.txt
```

---

# Stop the Servers

When the demonstration is finished, stop each running server.

In each PowerShell window press:

```text
Ctrl + C
```

Stop all five processes:

1. Backend
2. Citizen Portal
3. Worker Portal
4. Admin Portal
5. Portal Selector

---

# Development Workflow

After making changes, test the project before committing:

```powershell
npm run lint
npm run build
```

For the backend, make sure the FastAPI server starts correctly:

```powershell
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Then commit the changes:

```powershell
git add .
git commit -m "Update LokSetu"
git push
```

---

# Future Scope

Potential future improvements include:

- Advanced citizen service management
- Real-time service tracking
- Worker task assignment
- Government department integration
- Notifications and alerts
- Multilingual support
- AI-powered citizen assistance
- Demand prediction
- Analytics and reporting
- Mobile application
- Secure authentication and role-based authorization
- Production database integration
- Cloud deployment

---

# Contributing

Contributions are welcome.

### Create a branch

```powershell
git checkout -b feature/your-feature
```

Make your changes and test them locally.

### Commit

```powershell
git add .
git commit -m "Add your feature"
```

### Push

```powershell
git push origin feature/your-feature
```

Then create a Pull Request.

---

# Repository

GitHub:

https://github.com/ItSAnuj-bit/LokSetu

---

# Author

**Anuj Singh**

GitHub:

https://github.com/ItSAnuj-bit

LinkedIn:

https://www.linkedin.com/in/anuj-singh-4048793b9/
