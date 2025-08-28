import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import webSocketService from '../services/websocket';

const EventList = ({ events, getApprovedCount }) => {
  const navigate = useNavigate();
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  // Check WebSocket connection status
  const isConnected = webSocketService.isConnected();

  // Listen for real-time updates
  useEffect(() => {
    const handleUpdate = () => {
      setLastUpdateTime(new Date());
    };

    webSocketService.addListener('registration_updated', handleUpdate);
    webSocketService.addListener('registration_created', handleUpdate);

    return () => {
      webSocketService.removeListener('registration_updated', handleUpdate);
      webSocketService.removeListener('registration_created', handleUpdate);
    };
  }, []);

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

  return (
    <div className="container">
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
            Discover and register for exciting campus events. Click on any event to view details and register.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '12px',
              color: isConnected ? '#28a745' : '#dc3545',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>{isConnected ? '🟢' : '🔴'}</span>
              {isConnected ? 'Live Updates' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      <div className="events-grid">
        {events.map(event => (
          <div key={event.id} className="card event-card" style={{ cursor: 'pointer' }}>
            <div onClick={() => navigate(`/events/${event.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ 
                  color: '#333', 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  margin: 0,
                  flex: 1
                }}>
                  {event.name}
                </h3>
                <span className="attendee-count">
                  Attendees: {event.approved_count || 0}
                </span>
              </div>

              <p style={{ 
                color: '#666', 
                fontSize: '14px', 
                marginBottom: '16px',
                lineHeight: '1.5'
              }}>
                {event.shortDescription}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#888', fontWeight: '500' }}>📅</span>
                  <span style={{ fontSize: '14px', color: '#555' }}>
                    {formatDate(event.date)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#888', fontWeight: '500' }}>🕐</span>
                  <span style={{ fontSize: '14px', color: '#555' }}>
                    {formatTime(event.time)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#888', fontWeight: '500' }}>📍</span>
                  <span style={{ fontSize: '14px', color: '#555' }}>
                    {event.venue}
                  </span>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingTop: '12px',
                borderTop: '1px solid #eee'
              }}>
                <span style={{ fontSize: '12px', color: '#888' }}>
                  Capacity: {event.capacity}
                </span>
                <button className="btn btn-primary" style={{ fontSize: '14px' }}>
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '48px 24px',
          color: '#666'
        }}>
          <h3 style={{ marginBottom: '8px' }}>No Events Available</h3>
          <p>Check back later for new campus events!</p>
        </div>
      )}
    </div>
  );
};

export default EventList;
