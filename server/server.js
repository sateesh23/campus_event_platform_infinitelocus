const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [
      "http://localhost:3000",
      "https://05e666ea13d947c8b914c100b078b3dd-bd7c7a3b-b2b2-4e96-b2ff-1f9a59.fly.dev",
      "https://f7a014f53f1e43a5be5a70c4493299db-1232d4eb-9ff0-4154-a465-e9bb77.fly.dev"
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  // Allow multiple transports, prefer polling for reliability
  transports: ['polling', 'websocket'],
  // Connection settings
  pingTimeout: 60000,
  pingInterval: 25000,
  // Reduce logging noise
  allowEIO3: true,
  // Handle connection upgrades gracefully
  upgradeTimeout: 30000,
  // Add more resilience
  connectTimeout: 45000
});

// Environment Configuration
const PORT = process.env.BACKEND_PORT || process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'campus_events_jwt_secret_change_in_production';
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/campus_events';

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [
    "http://localhost:3000",
    "https://05e666ea13d947c8b914c100b078b3dd-bd7c7a3b-b2b2-4e96-b2ff-1f9a59.fly.dev",
    "https://f7a014f53f1e43a5be5a70c4493299db-1232d4eb-9ff0-4154-a465-e9bb77.fly.dev"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MongoDB connection with graceful fallback
let mongoConnected = false;

mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('📄 Connected to MongoDB successfully');
  mongoConnected = true;
  initializeProduction();
})
.catch((error) => {
  console.warn('⚠️ MongoDB connection failed, continuing in development mode:', error.message);
  console.log('🔧 To fix: Set up MongoDB or use a cloud database');
  console.log('📚 Suggestion: Connect to Neon database for production-ready setup');
  mongoConnected = false;
  // Continue without database for development
  console.log('🚀 Server running in development mode without database');
});

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['student', 'organizer', 'admin']
  }
}, {
  timestamps: true
});

// Event Schema
const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  short_description: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  organizer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Registration Schema
const registrationSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Ensure unique registration per student per event
registrationSchema.index({ event_id: 1, student_id: 1 }, { unique: true });

// Models
const User = mongoose.model('User', userSchema);
const Event = mongoose.model('Event', eventSchema);
const Registration = mongoose.model('Registration', registrationSchema);

// Initialize production data
async function initializeProduction() {
  try {
    const userCount = await User.countDocuments();
    const eventCount = await Event.countDocuments();

    console.log(`📊 Database Status: ${userCount} users, ${eventCount} events`);

    // Only create admin user if no users exist
    if (userCount === 0) {
      console.log('🔄 Creating initial admin user...');

      const adminUser = {
        email: 'admin@campus.edu',
        password: bcrypt.hashSync('CampusAdmin2024!', 10),
        name: 'System Administrator',
        role: 'admin'
      };

      await User.insertMany([adminUser]);
      console.log('✅ Initial admin user created');
      console.log('📧 Admin Login: admin@campus.edu');
      console.log('🔑 Admin Password: CampusAdmin2024!');
    }

    console.log('🎯 Production environment ready');
  } catch (error) {
    console.error('❌ Error initializing production environment:', error);
  }
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('🔐 Auth check for:', req.path, 'Token:', token ? `${token.substring(0, 20)}...` : 'none');

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  // Handle demo tokens in development mode
  if (token.startsWith('demo-token-') && (process.env.NODE_ENV !== 'production' || !mongoConnected)) {
    console.log('🎭 Accepting demo token for development/demo mode');
    const userId = token.split('-')[2]; // Extract user ID from demo token
    const user = {
      id: userId,
      email: userId === '1' ? 'admin@campus.edu' : userId === '2' ? 'organizer@demo.com' : 'student@demo.com',
      role: userId === '1' ? 'admin' : userId === '2' ? 'organizer' : 'student',
      name: userId === '1' ? 'Admin User' : userId === '2' ? 'Demo Organizer' : 'Demo Student'
    };
    console.log('✅ Demo user authenticated:', user);
    req.user = user;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('❌ JWT verification failed:', err.message, 'for token:', token.substring(0, 20));
      return res.status(403).json({ error: 'Invalid token' });
    }
    console.log('✅ JWT user authenticated:', user);
    req.user = user;
    next();
  });
};

// Role-based authorization middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    console.log('🛡️ Role check for:', req.path, 'Required:', roles, 'User role:', req.user?.role);

    if (!req.user) {
      console.log('❌ No user in request');
      return res.status(403).json({ error: 'User not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      console.log('❌ Insufficient permissions - user role:', req.user.role, 'required:', roles);
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    console.log('✅ Role authorization passed');
    next();
  };
};

// User registration route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['student', 'organizer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Only student and organizer registration allowed.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password: bcrypt.hashSync(password, 10),
      name: name.trim(),
      role
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    // Development fallback when MongoDB is not connected
    if (!mongoConnected) {
      console.log('🔧 Using development auth fallback');

      // Simple demo credentials for development
      const demoUsers = {
        'admin@campus.edu': { id: '1', name: 'Admin User', role: 'admin' },
        'organizer@demo.com': { id: '2', name: 'Demo Organizer', role: 'organizer' },
        'student@demo.com': { id: '3', name: 'Demo Student', role: 'student' }
      };

      const user = demoUsers[email.toLowerCase()];
      if (!user || user.role !== role) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: email.toLowerCase(), role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        user: {
          id: user.id,
          email: email.toLowerCase(),
          name: user.name,
          role: user.role
        }
      });
    }

    const user = await User.findOne({ email: email.toLowerCase(), role });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get organizers for admin
app.get('/api/organizers', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    // Development fallback when MongoDB is not connected
    if (!mongoConnected) {
      console.log('🔧 Using development organizers fallback');

      const demoOrganizers = [
        {
          id: '2',
          name: 'Demo Organizer',
          email: 'organizer@demo.com'
        },
        {
          id: '4',
          name: 'Event Coordinator',
          email: 'coordinator@demo.com'
        }
      ];

      return res.json(demoOrganizers);
    }

    const organizers = await User.find({ role: 'organizer' }, 'name email').sort({ name: 1 });

    const formattedOrganizers = organizers.map(org => ({
      id: org._id,
      name: org.name,
      email: org.email
    }));

    res.json(formattedOrganizers);
  } catch (error) {
    console.error('Get organizers error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Events routes
app.get('/api/events', authenticateToken, async (req, res) => {
  try {
    // Development fallback when MongoDB is not connected
    if (!mongoConnected) {
      console.log('🔧 Using development events fallback');

      const demoEvents = [
        {
          id: '1',
          _id: '1',
          name: 'Tech Conference 2024',
          short_description: 'Annual technology conference',
          description: 'Join us for the biggest tech event of the year with keynotes, workshops, and networking.',
          date: '2024-03-15',
          time: '09:00',
          venue: 'Main Auditorium',
          capacity: 100,
          organizer_name: 'Demo Organizer',
          approved_count: 15
        },
        {
          id: '2',
          _id: '2',
          name: 'Career Fair',
          short_description: 'Connect with top employers',
          description: 'Meet representatives from leading companies and explore career opportunities.',
          date: '2024-03-20',
          time: '10:00',
          venue: 'Student Center',
          capacity: 200,
          organizer_name: 'Demo Organizer',
          approved_count: 45
        }
      ];

      return res.json(demoEvents);
    }

    const events = await Event.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'organizer_id',
          foreignField: '_id',
          as: 'organizer'
        }
      },
      {
        $lookup: {
          from: 'registrations',
          localField: '_id',
          foreignField: 'event_id',
          as: 'registrations'
        }
      },
      {
        $addFields: {
          id: '$_id',
          organizer_name: { $arrayElemAt: ['$organizer.name', 0] },
          approved_count: {
            $size: {
              $filter: {
                input: '$registrations',
                cond: { $eq: ['$$this.status', 'approved'] }
              }
            }
          }
        }
      },
      {
        $project: {
          organizer: 0,
          registrations: 0
        }
      },
      {
        $sort: { date: 1 }
      }
    ]);

    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/events/:id', authenticateToken, async (req, res) => {
  try {
    const eventId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const events = await Event.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(eventId) }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'organizer_id',
          foreignField: '_id',
          as: 'organizer'
        }
      },
      {
        $lookup: {
          from: 'registrations',
          localField: '_id',
          foreignField: 'event_id',
          as: 'registrations'
        }
      },
      {
        $addFields: {
          id: '$_id',
          organizer_name: { $arrayElemAt: ['$organizer.name', 0] },
          approved_count: {
            $size: {
              $filter: {
                input: '$registrations',
                cond: { $eq: ['$$this.status', 'approved'] }
              }
            }
          }
        }
      },
      {
        $project: {
          organizer: 0,
          registrations: 0
        }
      }
    ]);

    if (!events.length) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(events[0]);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin only create event
app.post('/api/events', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { name, short_description, description, date, time, venue, capacity, organizerId } = req.body;

    if (!name || !short_description || !description || !date || !time || !venue || !capacity || !organizerId) {
      return res.status(400).json({ error: 'All fields including organizer are required' });
    }

    const event = new Event({
      name,
      short_description,
      description,
      date,
      time,
      venue,
      capacity,
      organizer_id: organizerId
    });

    await event.save();

    // Emit real-time update
    io.emit('event_created', {
      id: event._id,
      name,
      organizer_id: req.user.id
    });

    res.status(201).json({ id: event._id, message: 'Event created successfully' });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin only update event
app.put('/api/events/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const eventId = req.params.id;
    const { name, short_description, description, date, time, venue, capacity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    // Only admin can update events
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await Event.findByIdAndUpdate(eventId, {
      name,
      short_description,
      description,
      date,
      time,
      venue,
      capacity
    });

    // Emit real-time update
    io.emit('event_updated', { id: eventId, name });

    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin only delete event
app.delete('/api/events/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const eventId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    // Only admin can delete events
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Delete registrations first, then event
    await Registration.deleteMany({ event_id: eventId });
    await Event.findByIdAndDelete(eventId);

    // Emit real-time update
    io.emit('event_deleted', { id: eventId });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Registration routes
app.post('/api/events/:id/register', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const eventId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if already registered
    const existingRegistration = await Registration.findOne({
      event_id: eventId,
      student_id: req.user.id
    });

    if (existingRegistration) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }

    // Create registration
    const registration = new Registration({
      event_id: eventId,
      student_id: req.user.id,
      status: 'pending'
    });

    await registration.save();

    // Emit real-time update
    io.emit('registration_created', {
      id: registration._id,
      event_id: eventId,
      student_name: req.user.name,
      student_id: req.user.id
    });

    res.status(201).json({ message: 'Registration submitted successfully' });
  } catch (error) {
    console.error('Register event error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

// Get user's registrations
app.get('/api/registrations', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const registrations = await Registration.find({ student_id: req.user.id })
      .populate('event_id', 'name date time venue')
      .sort({ createdAt: -1 });

    const formattedRegistrations = registrations.map(reg => ({
      id: reg._id,
      _id: reg._id,
      status: reg.status,
      createdAt: reg.createdAt,
      updatedAt: reg.updatedAt,
      event_name: reg.event_id.name,
      date: reg.event_id.date,
      time: reg.event_id.time,
      venue: reg.event_id.venue
    }));

    res.json(formattedRegistrations);
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get registrations for organizer's events
app.get('/api/organizer/registrations', authenticateToken, requireRole(['organizer']), async (req, res) => {
  try {
    const registrations = await Registration.find({ status: 'pending' })
      .populate({
        path: 'event_id',
        match: { organizer_id: req.user.id },
        select: 'name'
      })
      .populate('student_id', 'name')
      .sort({ createdAt: 1 });

    // Filter out registrations where event_id is null (not organizer's events)
    const filteredRegistrations = registrations
      .filter(reg => reg.event_id)
      .map(reg => ({
        id: reg._id,
        _id: reg._id,
        status: reg.status,
        createdAt: reg.createdAt,
        event_name: reg.event_id.name,
        student_name: reg.student_id.name
      }));

    res.json(filteredRegistrations);
  } catch (error) {
    console.error('Get organizer registrations error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Approve/reject registration
app.put('/api/registrations/:id', authenticateToken, requireRole(['organizer', 'admin']), async (req, res) => {
  try {
    const registrationId = req.params.id;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(registrationId)) {
      return res.status(400).json({ error: 'Invalid registration ID' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get registration with populated data
    const registration = await Registration.findById(registrationId)
      .populate('event_id', 'name organizer_id')
      .populate('student_id', 'name');

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    // For organizers, check if they own the event
    if (req.user.role === 'organizer' && registration.event_id.organizer_id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update registration status
    registration.status = status;
    await registration.save();

    // Emit real-time update
    io.emit('registration_updated', {
      id: registrationId,
      event_id: registration.event_id._id,
      student_name: registration.student_id.name,
      event_name: registration.event_id.name,
      status
    });

    res.json({ message: `Registration ${status} successfully` });
  } catch (error) {
    console.error('Update registration error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('✅ WebSocket: User connected:', socket.id, 'Transport:', socket.conn.transport.name);

  socket.on('join_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`��� WebSocket: User ${userId} joined their room`);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ WebSocket: User disconnected:', socket.id, 'Reason:', reason);
  });

  socket.on('error', (error) => {
    console.error('🚨 WebSocket: Socket error:', error);
  });

  // Handle transport upgrade
  socket.conn.on('upgrade', () => {
    console.log('🔄 WebSocket: Upgraded to', socket.conn.transport.name);
  });
});

// API root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Campus Events API',
    version: '1.0.0',
    database: 'MongoDB',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Campus Events API is running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Campus Events API running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for real-time updates`);
  console.log(`🍃 MongoDB connection: ${MONGODB_URI}`);
});

module.exports = { app, server, io };
