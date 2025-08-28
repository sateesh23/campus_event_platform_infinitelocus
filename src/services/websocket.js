import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(userId) {
    // Disable WebSocket in production to prevent connection errors
    if (process.env.NODE_ENV === 'production') {
      console.log('ℹ️ WebSocket disabled in production - using offline mode');
      return;
    }

    if (this.socket?.connected) {
      this.disconnect();
    }

    // Use relative path for Socket.IO to leverage proxy
    const WS_URL = process.env.REACT_APP_WS_URL || window.location.origin;

    console.log('🔌 Attempting WebSocket connection to:', WS_URL);

    this.socket = io(WS_URL, {
      // Allow multiple transports with fallbacks, prefer polling for stability
      transports: ['polling', 'websocket'],
      upgrade: true,
      // Connection timeout settings
      timeout: 15000,
      forceNew: true,
      // Retry settings - be less aggressive to reduce console noise
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      maxReconnectionAttempts: 2,
      // Additional production settings
      autoConnect: true,
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      if (userId) {
        this.socket.emit('join_room', userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      // Only log meaningful errors, reduce console noise
      if (error.message !== 'xhr poll error' && error.type !== 'TransportError') {
        console.warn('⚠️ WebSocket connection error:', error.message);
      }
      // Don't throw error, just log it - app should continue working
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 WebSocket reconnected after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_error', (error) => {
      // Reduce noise - only log on first few attempts
      if (error.attemptNumber <= 2) {
        console.warn('⚠️ WebSocket reconnection failed:', error.message);
      }
    });

    this.socket.on('reconnect_failed', () => {
      console.log('ℹ️ Real-time features disabled - app will continue in offline mode');
    });

    // Set up event listeners
    this.setupEventListeners();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  setupEventListeners() {
    // Event updates
    this.socket.on('event_created', (data) => {
      this.notifyListeners('event_created', data);
    });

    this.socket.on('event_updated', (data) => {
      this.notifyListeners('event_updated', data);
    });

    this.socket.on('event_deleted', (data) => {
      this.notifyListeners('event_deleted', data);
    });

    // Registration updates
    this.socket.on('registration_created', (data) => {
      this.notifyListeners('registration_created', data);
    });

    this.socket.on('registration_updated', (data) => {
      this.notifyListeners('registration_updated', data);
    });
  }

  addListener(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);
  }

  removeListener(eventType, callback) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).delete(callback);
    }
  }

  notifyListeners(eventType, data) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket listener:', error);
        }
      });
    }
  }

  isConnected() {
    // In production, return false to indicate offline mode
    if (process.env.NODE_ENV === 'production') {
      return false;
    }
    return this.socket?.connected || false;
  }
}

export default new WebSocketService();
