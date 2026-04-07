# Real-Time Collaborative Document Platform - Frontend

A production-ready, full-featured collaborative document editing platform built with React 18, TypeScript, and Vite. Designed to connect with a Spring Boot backend.

## 🚀 Key Features

*   **Authentication & Session Management**: Secure registration and login leveraging JWT. Role-based access (User/Admin).
*   **Real-Time Collaborative Editing**: Powered by TipTap, Yjs, and Y-Websocket for seamless, multi-user document updates.
*   **Presence Indicators**: Shared cursors and online user lists showing who is active.
*   **Document Management**: CRUD operations with pagination, sorting, and search.
*   **History & Versions**: A visual timeline of document edits with version snapshots.
*   **Collaborator Controls**: Granular role-based permissions (OWNER, EDITOR, VIEWER).
*   **Notifications Hub**: Stay updated with document invitations and system alerts.
*   **Admin Console**: Dedicated dashboard for user management and platform statistics.
*   **Design First**: A stunning, responsive UI using Tailwind CSS 3.4 with framer-motion animations.

---

## 🏗️ Architecture

The project follows a feature-based structure for scalability and maintainability:

```text
src/
├── api/            # Centralized API clients & Axios interceptors
├── components/     # Reusable UI primitives (Buttons, Inputs, etc.)
├── features/       # Feature-scoped modules (Auth, Documents, Collab...)
│   ├── auth/       # Login, Register, Auth Store (Zustand)
│   ├── admin/      # Management dashboards
│   └── documents/  # Editor, List, Modals, Timeline
├── hooks/          # Shared custom hooks
├── layout/         # Route guards, Main/Auth shells
├── store/          # Global state management
└── types/          # Shared TS interfaces (OpenAPI compatible)
```

---

## 🛠️ Setup & Local Development

### Prerequisites
*   [Node.js](https://nodejs.org/) (v16+)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation
1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install --legacy-peer-deps
    ```

### Configuration
Create a `.env` file in the root (a `.env.example` is provided):
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_BASE_URL=ws://localhost:8080/ws
```

### Running Locally
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

---

## 🧪 Testing

### Unit & Integration Tests (Vitest)
```bash
npm run test
```

### E2E Smoke Flows (Playwright)
```bash
npm run test:e2e
```

---

## 📦 Deployment (Render / Static Hosting)

This project is optimized for static hosting providers like Render, Vercel, or Netlify.

1.  **Build Command**: `npm run build`
2.  **Output Directory**: `dist`
3.  **Client-Side Routing**: If deploying to a platform without automatic SPA support, ensure all requests redirect to `/index.html`.

---

## 📋 API Integration Details

The following endpoints are implemented according to the OpenAPI specification:

*   **Auth**: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`
*   **Documents**: `/api/documents` (GET, POST), `/api/documents/{id}` (GET, PUT, DELETE)
*   **Collaborators**: `/api/documents/{id}/collaborators` (POST, PUT, DELETE)
*   **History**: `/api/documents/{id}/history` (GET)
*   **Admin**: `/api/admin/users` (GET, DELETE), `/api/admin/stats` (GET)

---

## ⚠️ Known Limitations & TODOs

1.  **Offline Persistence**: Basic persistence implemented via Zustand, but document buffer local-caching on disconnect needs refinement.
2.  **Advanced Rich Text**: Currently supports core text formatting. Additional support for images and tables can be added via TipTap extensions.
3.  **Optimistic UI**: Implemented for basic actions; deep nesting in collaborators list may need fine-grained updates.
