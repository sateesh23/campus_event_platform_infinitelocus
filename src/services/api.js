import { mockUsers, mockEvents, mockOrganizers } from '../utils/mockData';

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


      if (error.name === 'TypeError' && errorMessage.includes('fetch')) {
        const newError = new Error('Cannot connect to server. Please ensure the backend is running.');
        console.error('❌ Connection Error:', newError.message);
        throw newError;
      }

      console.error('❌ Throwing error:', errorMessage);
      throw new Error(errorMessage);
    }
  }


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

  async getOrganizers() {
    return await this.request('/organizers');
  }

  async healthCheck() {
    return await this.request('/health');
  }
}

export default new ApiService();
