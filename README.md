# Campus Events Management Platform

A real-time campus event platform with role-based access control for students, organizers, and administrators.

## 🚀 Features

### Backend
- **CRUD Operations**: Complete event and registration management
- **Role-based Authentication**: JWT-based auth for student/organizer/admin roles
- **Real-time Updates**: WebSocket integration for live attendee count updates
- **RESTful API**: Comprehensive API endpoints for all operations

### Frontend  
- **Event List**: Real-time attendee count display
- **Event Details**: Registration functionality with status tracking
- **Organizer Dashboard**: Approve/reject participant registrations
- **Responsive Design**: Mobile-friendly interface with orange/off-white theme

### Database
- **SQLite Database**: Tables for events, users, and registrations
- **Approval Status**: Pending/approved/rejected registration states
- **Data Persistence**: Volume-mounted database for Docker deployment

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js, Socket.IO, SQLite, JWT
- **Frontend**: React, React Router, Socket.IO Client
- **Database**: SQLite with persistent storage
- **Containerization**: Docker & Docker Compose

## 🏃‍♂️ Quick Start

### Option 1: Docker Compose (Recommended)

1. **Build and run the entire stack:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost:5000/api

### Option 2: Local Development

1. **Install dependencies:**
   ```bash
   npm install
   cd server && npm install
   ```

2. **Start both frontend and backend:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## ��� Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Student | student@example.com | password |
| Organizer | organizer@example.com | password |
| Admin | admin@example.com | password |

## 📱 User Flows

### Student Workflow
1. **Login** → Select "Student" role
2. **Browse Events** → View event list with real-time attendee counts
3. **Register** → Click event → Register with approval workflow
4. **Track Status** → See "Pending" or "Approved" status

### Organizer Workflow  
1. **Login** → Select "Organizer" role
2. **Dashboard** → View created events and pending registrations
3. **Manage Registrations** → Approve/reject student registrations
4. **Real-time Updates** → Attendee counts update live

### Admin Workflow
1. **Login** → Select "Admin" role  
2. **Event Management** → Full CRUD operations for events
3. **System Overview** → Statistics and system management

## 🔄 Real-time Features

- **Live Attendee Counts**: Updates automatically when registrations are approved
- **WebSocket Integration**: Instant notifications across all connected users
- **Connection Status**: Visual indicators for real-time connection status
- **Graceful Fallback**: App continues working if WebSocket fails

## 🗄 Database Schema

### Users Table
- id, email, password (hashed), name, role, created_at

### Events Table  
- id, name, short_description, description, date, time, venue, capacity, organizer_id, created_at

### Registrations Table
- id, event_id, student_id, status (pending/approved/rejected), created_at, updated_at

## 🐳 Docker Deployment

The application is fully containerized with multi-stage builds:

- **Frontend**: Nginx-served React build with API proxying
- **Backend**: Node.js API server with SQLite database
- **Networking**: Internal Docker network with proper service discovery
- **Volumes**: Persistent database storage

### Production Environment Variables

```env
NODE_ENV=production
JWT_SECRET=your_secure_jwt_secret_here
PORT=5000
```

## 🛡 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage  
- **Role-based Authorization**: Middleware-protected routes
- **CORS Configuration**: Proper cross-origin resource sharing
- **Input Validation**: Server-side validation for all inputs

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Events
- `GET /api/events` - List all events with attendee counts
- `GET /api/events/:id` - Get specific event details
- `POST /api/events` - Create new event (organizer/admin)
- `PUT /api/events/:id` - Update event (organizer/admin)  
- `DELETE /api/events/:id` - Delete event (organizer/admin)

### Registrations
- `POST /api/events/:id/register` - Register for event (student)
- `GET /api/registrations` - Get user's registrations (student)
- `GET /api/organizer/registrations` - Get pending registrations (organizer)
- `PUT /api/registrations/:id` - Approve/reject registration (organizer)

### Health Check
- `GET /api/health` - Service health status

## 🔧 Development

### Project Structure
```
├── src/                    # React frontend source
│   ├── components/         # React components
│   ├── services/          # API and WebSocket services
│   └── App.js             # Main application component
├── server/                # Node.js backend
│   ├── server.js          # Express server setup
│   └── package.json       # Backend dependencies
├── docker-compose.yml     # Full stack deployment
└── README.md             # This file
```

### Available Scripts
- `npm run dev` - Start both frontend and backend in development
- `npm run build` - Build frontend for production
- `npm run server` - Start backend only
- `docker-compose up --build` - Build and run containerized stack

## �� Assignment Requirements ✅

**✅ Backend Requirements:**
- CRUD for events and registrations
- Role-based authentication (student/organizer/admin)
- WebSocket for real-time updates

**✅ Frontend Requirements:**  
- Event list with real-time attendee count
- Event detail page with register button
- Organizer dashboard for approval workflow

**✅ Database Requirements:**
- Events, users, registrations tables
- Registration approval status tracking

**✅ Bonus Requirements:**
- Docker containerization with docker-compose
- Production-ready deployment setup
