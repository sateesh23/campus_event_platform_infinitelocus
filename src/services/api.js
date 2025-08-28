import { mockUsers, mockEvents, mockOrganizers } from '../utils/mockData';

// Detect API URL based on environment
const API_BASE_URL = process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? `${window.location.origin}/api`
    : '/api');

class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` })
    };
  }

  async request(endpoint, options = {}) {
    // Check if we're in production or demo mode
    const isProductionDemo = process.env.NODE_ENV === 'production' ||
                            window.location.hostname.includes('fly.dev') ||
                            process.env.REACT_APP_DEMO_MODE === 'true';

    // In production demo mode, use mock data for all API calls
    if (isProductionDemo) {
      console.log('🎭 Using demo mode for:', endpoint);

      if (endpoint.includes('/auth/login')) {
        return this.handleMockLogin(options);
      }

      if (endpoint.includes('/events')) {
        return this.handleMockEvents(endpoint);
      }

      if (endpoint.includes('/organizers')) {
        return mockOrganizers;
      }

      if (endpoint.includes('/registrations')) {
        return []; // Return empty registrations for demo
      }

      // For any other endpoint, return appropriate demo response
      return this.handleProductionFallback(endpoint, options);
    }

    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

    console.log('🔄 API Request:', {
      url,
      method: options.method || 'GET',
      headers: config.headers
    });

    try {
      const response = await fetch(url, config);

      console.log('📡 API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: `HTTP ${response.status}: ${response.statusText}`
        }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ API Success:', data);
      return data;
    } catch (error) {
      const errorMessage = error.message || error.toString() || 'Unknown error';
      console.error('❌ API request failed:', {
        url,
        errorMessage: errorMessage,
        errorName: error.name,
        status: error.status || 'N/A',
        error: error
      });

      // In production or demo mode, fallback to mock data on any API errors
      const isProductionDemo = process.env.NODE_ENV === 'production' ||
                              window.location.hostname.includes('fly.dev') ||
                              process.env.REACT_APP_DEMO_MODE === 'true';

      if (isProductionDemo) {
        console.log('🎭 Switching to demo mode due to API error:', errorMessage);
        return this.handleProductionFallback(endpoint, options);
      }

      // More descriptive error messages
      if (error.name === 'TypeError' && errorMessage.includes('fetch')) {
        const newError = new Error('Cannot connect to server. Please ensure the backend is running.');
        console.error('❌ Connection Error:', newError.message);
        throw newError;
      }

      // Ensure we always throw a proper Error object with a string message
      console.error('❌ Throwing error:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  handleMockLogin(options) {
    const body = JSON.parse(options.body || '{}');
    const { email, password, role } = body;

    // Updated demo credentials to match backend
    const demoUsers = {
      'admin@campus.edu': { id: '1', name: 'Admin User', role: 'admin' },
      'organizer@demo.com': { id: '2', name: 'Demo Organizer', role: 'organizer' },
      'student@demo.com': { id: '3', name: 'Demo Student', role: 'student' }
    };

    const user = demoUsers[email.toLowerCase()];

    // Accept any password for demo purposes (like backend does)
    if (user && user.role === role && password) {
      // Create a demo token - in production mode, API calls will use mock data anyway
      const token = `demo-token-${user.id}-${Date.now()}`;
      return { token, user };
    } else {
      throw new Error('Invalid credentials. Try: admin@campus.edu, organizer@demo.com, or student@demo.com');
    }
  }

  handleMockEvents(endpoint) {
    if (endpoint.includes('/events/') && !endpoint.includes('/register')) {
      const eventId = endpoint.split('/events/')[1];
      return mockEvents.find(e => e.id === eventId) || null;
    }
    return mockEvents;
  }

  handleProductionFallback(endpoint, options) {
    console.log('📋 Demo fallback for endpoint:', endpoint, 'method:', options.method || 'GET');

    if (endpoint.includes('/auth/login')) {
      return this.handleMockLogin(options);
    }

    if (endpoint.includes('/events')) {
      return this.handleMockEvents(endpoint);
    }

    if (endpoint.includes('/organizers')) {
      return mockOrganizers;
    }

    if (endpoint.includes('/registrations')) {
      // Return mock registrations data
      return [];
    }

    if (endpoint.includes('/health')) {
      return { status: 'OK', message: 'Demo mode', database: 'Demo' };
    }

    // For mutation operations, return success responses
    if (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE') {
      return { success: true, message: 'Demo mode - changes not saved' };
    }

    // For GET requests, return empty arrays
    return [];
  }

  // Authentication
  async login(email, password, role) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role })
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async register(email, password, name, role) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role })
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  logout() {
    this.setToken(null);
  }

  // Events
  async getEvents() {
    return await this.request('/events');
  }

  async getEvent(id) {
    return await this.request(`/events/${id}`);
  }

  async createEvent(eventData) {
    return await this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  }

  async updateEvent(id, eventData) {
    return await this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    });
  }

  async deleteEvent(id) {
    return await this.request(`/events/${id}`, {
      method: 'DELETE'
    });
  }

  // Registrations
  async registerForEvent(eventId) {
    return await this.request(`/events/${eventId}/register`, {
      method: 'POST'
    });
  }

  async getMyRegistrations() {
    return await this.request('/registrations');
  }

  async getOrganizerRegistrations() {
    return await this.request('/organizer/registrations');
  }

  async updateRegistrationStatus(registrationId, status) {
    return await this.request(`/registrations/${registrationId}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  // Get organizers (admin only)
  async getOrganizers() {
    return await this.request('/organizers');
  }

  // Health check
  async healthCheck() {
    return await this.request('/health');
  }
}

export default new ApiService();
