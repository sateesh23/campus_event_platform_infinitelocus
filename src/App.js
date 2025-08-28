import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ErrorBoundary from './components/ErrorBoundary';
import ConnectionStatus from './components/ConnectionStatus';
import DemoNotice from './components/DemoNotice';
import EventList from './components/EventList';
import EventDetail from './components/EventDetail';
import OrganizerDashboard from './components/OrganizerDashboard';
import AdminPanel from './components/AdminPanel';
import Header from './components/Header';
import apiService from './services/api';
import webSocketService from './services/websocket';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  // Check for existing session and initialize data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          try {
            // Try to fetch user data to validate token
            await loadEvents();

            // For now, decode token manually (in production, use proper JWT decode)
            const payload = JSON.parse(atob(token.split('.')[1]));
            setCurrentUser({
              id: payload.id,
              email: payload.email,
              name: payload.name,
              role: payload.role
            });

            // Connect WebSocket (non-blocking, disabled in production)
            try {
              webSocketService.connect(payload.id);
              setupWebSocketListeners();
            } catch (error) {
              console.warn('⚠️ WebSocket connection failed, continuing without real-time features:', error);
            }
          } catch (apiError) {
            console.warn('⚠️ Backend validation failed, clearing stored session:', apiError.message);
            handleLogout();
          }
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleLogin = async (email, password, role) => {
    try {
      const response = await apiService.login(email, password, role);
      setCurrentUser(response.user);
      setShowRegister(false);

      // Connect WebSocket (non-blocking)
      try {
        webSocketService.connect(response.user.id);
        setupWebSocketListeners();
      } catch (error) {
        console.warn('⚠️ WebSocket connection failed, continuing without real-time features:', error);
      }

      // Load initial data
      await loadEvents();

      return response;
    } catch (error) {
      console.error('Login failed:', error.message || error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const handleUserRegistration = async (email, password, name, role) => {
    try {
      const response = await apiService.register(email, password, name, role);
      setCurrentUser(response.user);
      setShowRegister(false);

      // Connect WebSocket (non-blocking)
      try {
        webSocketService.connect(response.user.id);
        setupWebSocketListeners();
      } catch (error) {
        console.warn('⚠️ WebSocket connection failed, continuing without real-time features:', error);
      }

      // Load initial data
      await loadEvents();

      return response;
    } catch (error) {
      console.error('Registration failed:', error.message || error);
      throw new Error(error.message || 'Registration failed');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setEvents([]);
    setRegistrations([]);
    apiService.logout();
    webSocketService.disconnect();
  };

  const handleRegister = async (eventId) => {
    try {
      await apiService.registerForEvent(eventId);
      // Reload events to get updated counts
      await loadEvents();
      return { success: true, message: 'Registration submitted successfully' };
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      console.error('Registration failed:', errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const handleApproveRegistration = async (registrationId) => {
    try {
      await apiService.updateRegistrationStatus(registrationId, 'approved');
      await loadRegistrations();
      await loadEvents(); // Refresh events to update counts
    } catch (error) {
      const errorMessage = error.message || 'Failed to approve registration';
      console.error('Approve registration failed:', errorMessage);
      setError(errorMessage);
    }
  };

  const handleRejectRegistration = async (registrationId) => {
    try {
      await apiService.updateRegistrationStatus(registrationId, 'rejected');
      await loadRegistrations();
    } catch (error) {
      const errorMessage = error.message || 'Failed to reject registration';
      console.error('Reject registration failed:', errorMessage);
      setError(errorMessage);
    }
  };

  const getApprovedCount = (eventId) => {
    const event = events.find(e => e.id === eventId);
    return event ? event.approved_count || 0 : 0;
  };

  const getUserRegistration = (eventId) => {
    if (!currentUser) return null;
    return registrations.find(reg =>
      reg.event_id === eventId && reg.student_id === currentUser.id
    );
  };

  const handleCreateEvent = async (eventData) => {
    try {
      await apiService.createEvent(eventData);
      await loadEvents();
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Failed to create event';
      console.error('Create event failed:', errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const handleUpdateEvent = async (eventId, eventData) => {
    try {
      await apiService.updateEvent(eventId, eventData);
      await loadEvents();
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Failed to update event';
      console.error('Update event failed:', errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await apiService.deleteEvent(eventId);
      await loadEvents();
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Failed to delete event';
      console.error('Delete event failed:', errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Load events from API
  const loadEvents = async () => {
    try {
      const eventsData = await apiService.getEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error('Failed to load events:', error);
      setError(error.message);
    }
  };

  // Load organizers for admin
  const loadOrganizers = async () => {
    if (!currentUser || currentUser.role !== 'admin') return;

    try {
      const organizersData = await apiService.getOrganizers();
      setOrganizers(organizersData);
    } catch (error) {
      const errorMessage = error.message || 'Failed to load organizers';
      console.error('Failed to load organizers:', errorMessage);
      // Don't set global error for this as it's not critical for app function
    }
  };

  // Load registrations for current user
  const loadRegistrations = async () => {
    if (!currentUser) return;

    try {
      if (currentUser.role === 'student') {
        const userRegistrations = await apiService.getMyRegistrations();
        setRegistrations(userRegistrations);
      } else if (currentUser.role === 'organizer') {
        const orgRegistrations = await apiService.getOrganizerRegistrations();
        setRegistrations(orgRegistrations);
      }
    } catch (error) {
      console.error('Failed to load registrations:', error);
    }
  };

  // Set up WebSocket listeners
  const setupWebSocketListeners = () => {
    webSocketService.addListener('event_created', () => {
      loadEvents();
    });

    webSocketService.addListener('event_updated', () => {
      loadEvents();
    });

    webSocketService.addListener('event_deleted', () => {
      loadEvents();
    });

    webSocketService.addListener('registration_created', () => {
      loadEvents();
      loadRegistrations();
    });

    webSocketService.addListener('registration_updated', () => {
      loadEvents();
      loadRegistrations();
    });
  };

  // Load registrations and organizers when user changes
  useEffect(() => {
    if (currentUser) {
      loadRegistrations();
      loadOrganizers();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#fefcfa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #ff8c00',
            borderTop: '3px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#ff8c00', fontSize: '16px' }}>Loading Campus Events...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
          <div className="App">
            <ConnectionStatus />
            <DemoNotice />
            {currentUser && <Header user={currentUser} onLogout={handleLogout} />}

          <Routes>
          <Route
            path="/login"
            element={
              currentUser ?
                <Navigate to={
                  currentUser.role === 'student' ? '/events' :
                  currentUser.role === 'organizer' ? '/dashboard' :
                  currentUser.role === 'admin' ? '/admin' : '/events'
                } /> :
                showRegister ?
                  <Register
                    onRegister={handleUserRegistration}
                    onSwitchToLogin={() => setShowRegister(false)}
                  /> :
                  <Login
                    onLogin={handleLogin}
                    onSwitchToRegister={() => setShowRegister(true)}
                  />
            }
          />
          
          <Route 
            path="/events" 
            element={
              currentUser && currentUser.role === 'student' ? 
                <EventList 
                  events={events} 
                  getApprovedCount={getApprovedCount}
                /> : 
                <Navigate to="/login" />
            } 
          />
          
          <Route 
            path="/events/:id" 
            element={
              currentUser && currentUser.role === 'student' ? 
                <EventDetail 
                  events={events}
                  currentUser={currentUser}
                  getUserRegistration={getUserRegistration}
                  onRegister={handleRegister}
                  getApprovedCount={getApprovedCount}
                /> : 
                <Navigate to="/login" />
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={
              currentUser && currentUser.role === 'organizer' ? 
                <OrganizerDashboard 
                  events={events}
                  registrations={registrations}
                  currentUser={currentUser}
                  onApprove={handleApproveRegistration}
                  onReject={handleRejectRegistration}
                  getApprovedCount={getApprovedCount}
                /> : 
                <Navigate to="/login" />
            }
          />

          <Route
            path="/admin"
            element={
              currentUser && currentUser.role === 'admin' ?
                <AdminPanel
                  events={events}
                  organizers={organizers}
                  onCreateEvent={handleCreateEvent}
                  onUpdateEvent={handleUpdateEvent}
                  onDeleteEvent={handleDeleteEvent}
                  getApprovedCount={getApprovedCount}
                /> :
                <Navigate to="/login" />
            }
          />

          <Route
            path="/"
            element={<Navigate to="/login" />}
          />
            </Routes>
          </div>
        </Router>
    </ErrorBoundary>
  );
}

export default App;
