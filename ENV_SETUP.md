# Environment Variables Setup

## Frontend (.env)
Create a `.env` file in the root directory:

```env
# Campus Events Frontend Configuration
REACT_APP_API_URL=/api
REACT_APP_WS_URL=
REACT_APP_ENV=development
REACT_APP_DEMO_MODE=true
REACT_APP_SHOW_DEBUG=false
```

## Backend (server/.env)
Create a `.env` file in the server directory:

```env
# Campus Events Backend Configuration

# Server Configuration
BACKEND_PORT=5001
NODE_ENV=development

# Database Configuration  
MONGODB_URI=mongodb://localhost:27017/campus_events

# Authentication & Security
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=24h

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000

# Demo Credentials (remove in production)
DEMO_ADMIN_EMAIL=admin@campus.edu
DEMO_ORGANIZER_EMAIL=organizer@demo.com  
DEMO_STUDENT_EMAIL=student@demo.com
```

## .gitignore
Add these lines to your `.gitignore` file:

```
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
server/.env
server/.env.local

# Sensitive data
config/secrets.js
*.key
*.pem
```

## Security Notes

1. **Never commit .env files** to Git repositories
2. **Change JWT_SECRET** in production to a strong, unique value
3. **Use strong database passwords** in production
4. **Remove demo credentials** in production environments
5. **Use HTTPS** in production for all communications

## Production Deployment

For production deployment, set these environment variables:
- `NODE_ENV=production`
- `JWT_SECRET=<strong-random-key>`
- `MONGODB_URI=<production-database-url>`
- `CORS_ORIGINS=<your-frontend-domain>`
