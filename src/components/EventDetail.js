import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import webSocketService from '../services/websocket';

const EventDetail = ({ events, currentUser, getUserRegistration, onRegister, getApprovedCount }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  const event = events.find(e => e.id === parseInt(id));
  const registration = getUserRegistration(parseInt(id));
  const isConnected = webSocketService.isConnected();

  // Listen for real-time updates for this specific event
  useEffect(() => {
    const handleRegistrationUpdate = (data) => {
      if (data.event_id === parseInt(id)) {
        setLastUpdateTime(new Date());
        if (data.status === 'approved') {
          setMessage('✨ Attendee count updated in real-time!');
          setTimeout(() => setMessage(''), 3000);
        }
      }
    };

    webSocketService.addListener('registration_updated', handleRegistrationUpdate);
    webSocketService.addListener('registration_created', handleRegistrationUpdate);

    return () => {
      webSocketService.removeListener('registration_updated', handleRegistrationUpdate);
      webSocketService.removeListener('registration_created', handleRegistrationUpdate);
    };
  }, [id]);
  
  if (!event) {
    return (
      <div className="container">
        <div className="card">
          <h2>Event Not Found</h2>
          <p>The event you're looking for doesn't exist.</p>
          <button className="btn btn-primary" onClick={() => navigate('/events')}>
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const result = await onRegister(event.id);
      if (result.success) {
        setMessage('Registration submitted, awaiting approval.');
      } else {
        setMessage(result.message || 'Registration failed.');
      }
    } catch (error) {
      setMessage('Registration failed. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const getRegistrationButton = () => {
    if (!registration) {
      return (
        <button
          className="btn btn-orange"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register for Event'}
        </button>
      );
    }

    if (registration.status === 'pending') {
      return (
        <button className="btn" disabled style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          cursor: 'not-allowed'
        }}>
          Pending Approval
        </button>
      );
    }

    if (registration.status === 'approved') {
      return (
        <button className="btn" disabled style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          cursor: 'not-allowed'
        }}>
          Approved ✅
        </button>
      );
    }
  };

  const approvedCount = event.approved_count || 0;
  const availableSpots = event.capacity - approvedCount;

  return (
    <div className="container">
      <div style={{ marginBottom: '16px' }}>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/events')}
          style={{ fontSize: '14px' }}
        >
          ← Back to Events
        </button>
      </div>

      <div className="card">
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ 
            color: '#333', 
            fontSize: '28px', 
            fontWeight: 'bold', 
            marginBottom: '8px' 
          }}>
            {event.name}
          </h1>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="attendee-count">
              Attendees: {approvedCount}
            </span>
            <span style={{
              fontSize: '14px',
              color: availableSpots > 10 ? '#28a745' : availableSpots > 0 ? '#ffc107' : '#dc3545',
              fontWeight: '600'
            }}>
              {availableSpots > 0 ? `${availableSpots} spots available` : 'Event Full'}
            </span>
            <span style={{
              fontSize: '12px',
              color: isConnected ? '#28a745' : '#dc3545',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>{isConnected ? '🟢' : '🔴'}</span>
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="event-details" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '18px' }}>📅</span>
              <div>
                <strong>Date:</strong> {formatDate(event.date)}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '18px' }}>🕐</span>
              <div>
                <strong>Time:</strong> {formatTime(event.time)}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '18px' }}>📍</span>
              <div>
                <strong>Venue:</strong> {event.venue}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '18px' }}>👥</span>
              <div>
                <strong>Capacity:</strong> {event.capacity} attendees
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '12px', color: '#333' }}>Description</h3>
            <p style={{ 
              lineHeight: '1.6', 
              color: '#555', 
              fontSize: '16px',
              whiteSpace: 'pre-line'
            }}>
              {event.description}
            </p>
          </div>
        </div>

        {message && (
          <div style={{ 
            backgroundColor: '#d4edda', 
            color: '#155724', 
            padding: '12px', 
            borderRadius: '4px', 
            marginBottom: '16px',
            textAlign: 'center',
            fontWeight: '600'
          }}>
            {message}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {getRegistrationButton()}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
