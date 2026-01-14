
# Partners Ops

The Operating System for Modern Kennels.

## Development Setup

This project consists of a React frontend and a Node.js backend.

### Prerequisites

- Node.js (v18+)
- npm

### Quick Start

1.  **Install Frontend Dependencies**
    ```bash
    npm install
    ```

2.  **Install Backend Dependencies**
    ```bash
    npm --prefix server install
    ```

3.  **Start Development Server (Both Client & Server)**
    ```bash
    npm run dev:all
    ```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8787

### Individual Commands

- `npm run dev:client`: Start only the React frontend.
- `npm run dev:server`: Start only the Node.js backend.

### Project Structure

- `/`: React Frontend (Vite, Tailwind, Zustand)
- `/server`: Node.js Backend (HTTP, File-based JSON DB)
- `/src/shared`: Shared types and utilities

### API & Authentication

The local server uses a file-based JSON database located in `server/data/db.json`.
Default admin credentials (seeded on first run):
- Email: `admin@local`
- Password: `admin123`
