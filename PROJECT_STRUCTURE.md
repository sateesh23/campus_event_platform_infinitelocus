# Campus Events App - Project Structure

## Overview
This project follows a clean separation between frontend (React) and backend (Node.js/Express) with well-organized folders.

## Directory Structure

```
campus-events-app/
├── 📁 Frontend (React App)
│   ├── public/                    # Public assets
│   │   ├── index.html            # Main HTML file
│   │   └── api/health            # API health check endpoint
│   ├── src/                      # Source code
│   │   ├── components/           # React components
│   │   │   ├── AdminPanel.js     # Admin dashboard
│   │   │   ├── ConnectionStatus.js # Connection indicator
│   │   │   ├── DemoNotice.js     # Demo mode notice
│   │   │   ├── ErrorBoundary.js  # Error handling
│   │   │   ├── EventDetail.js    # Event details view
│   │   │   ├── EventList.js      # Events listing
│   │   │   ├── Header.js         # App header
│   │   │   ├── Login.js          # Login form
│   │   │   ├── OrganizerDashboard.js # Organizer dashboard
│   │   │   └── Register.js       # Registration form
│   │   ├── services/             # API and external services
│   │   │   ├── api.js           # API service layer
│   │   │   └── websocket.js     # WebSocket service
│   │   ├── utils/                # Utility functions
│   │   │   ├── mockData.js      # Demo data
│   │   │   └── suppressWarnings.js # Development utilities
│   │   ├── App.js               # Main App component
│   │   ├── index.js             # React entry point
│   │   ├── index.css            # Global styles
│   │   └── setupProxy.js        # Development proxy setup
│   └── package.json             # Frontend dependencies
│
├── 📁 Backend (Node.js/Express API)
│   ├── server/
│   │   ├── server.js            # Express server & API routes
│   │   ├── package.json         # Backend dependencies
│   │   └── Dockerfile           # Backend container config
│   └── .env                     # Backend environment variables (create manually)
│
├── 📁 Configuration & Documentation
│   ├── .env                     # Frontend environment variables (create manually)
│   ├── .env.example             # Environment variables template (create manually)
│   ├── ENV_SETUP.md             # Environment setup guide
│   ├── PROJECT_STRUCTURE.md     # This file
│   ├── README.md                # Project documentation
│   ├── package.json             # Root package.json (frontend)
│   ├── nginx.conf               # Nginx configuration
│   └── Dockerfile               # Frontend container config
│
└── 📁 Deployment
    └── docker-compose.yml       # Multi-container setup (if needed)
```

## Architecture Overview

### Frontend (React)
- **Location**: `/src`
- **Port**: 3000 (development)
- **Technology**: React 18, React Router, Socket.IO Client
- **Structure**: Component-based architecture with services layer

### Backend (Express API)
- **Location**: `/server`
- **Port**: 5001 (development)
- **Technology**: Node.js, Express, Socket.IO, Mongoose
- **Database**: MongoDB (with development fallback)

## Key Design Principles

### 1. **Separation of Concerns**
- Frontend and backend are completely separate
- Clear API boundaries
- Independent deployment possible

### 2. **Component Organization**
- Components grouped by functionality
- Services separated from UI components
- Utilities isolated for reusability

### 3. **Environment Configuration**
- Sensitive data in `.env` files
- Environment-specific configurations
- Production-ready deployment setup

### 4. **Development Experience**
- Hot reloading for frontend
- API proxy for seamless development
- Comprehensive error handling

## Getting Started

1. **Install Dependencies**:
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd server && npm install
   ```

2. **Environment Setup**:
   - Copy `.env.example` to `.env` (frontend)
   - Create `server/.env` (backend)
   - See `ENV_SETUP.md` for details

3. **Development**:
   ```bash
   npm run dev  # Starts both frontend and backend
   ```

4. **Production Build**:
   ```bash
   npm run build
   ```

## Best Practices

### File Naming
- **Components**: PascalCase (e.g., `EventList.js`)
- **Services**: camelCase (e.g., `api.js`)
- **Utilities**: camelCase (e.g., `mockData.js`)

### Code Organization
- Keep components focused and single-purpose
- Use services for API calls and business logic
- Place shared utilities in `/utils`
- Environment variables for all configuration

### Security
- Never commit `.env` files
- Use strong JWT secrets in production
- Validate all inputs
- Implement proper CORS policies
