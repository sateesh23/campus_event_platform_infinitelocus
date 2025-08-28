import React, { useState, useEffect } from 'react';
import webSocketService from '../services/websocket';

const OrganizerDashboard = ({
  events,
  registrations,
  currentUser,
  onApprove,
  onReject,
  getApprovedCount
}) => {
  const [recentAction, setRecentAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const isConnected = webSocketService.isConnected();

  // Listen for real-time updates
  useEffect(() => {
    const handleUpdate = (data) => {
      setRecentAction(data);
      setTimeout(() => setRecentAction(null), 5000);
    };

    webSocketService.addListener('registration_updated', handleUpdate);
    webSocketService.addListener('registration_created', handleUpdate);

    return () => {
      webSocketService.removeListener('registration_updated', handleUpdate);
      webSocketService.removeListener('registration_created', handleUpdate);
    };
  }, []);
  
  // Get events created by current organizer
  const myEvents = events.filter(event => event.organizer_id === currentUser.id);
  
  // Get pending registrations for organizer's events (these come from the API)
  const pendingRegistrations = registrations.filter(reg => reg.status === 'pending');

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getEventName = (eventId) => {
    const event = events.find(e => e.id === eventId);
    return event ? event.name : 'Unknown Event';
  };

  const handleApprove = async (registrationId) => {
    setLoading(true);
    try {
      await onApprove(registrationId);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (registrationId) => {
    setLoading(true);
    try {
      await onReject(registrationId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* My Events Section */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#333', margin: 0, fontSize: '24px' }}>
            My Events
          </h2>
          <span style={{
            fontSize: '12px',
            color: isConnected ? '#28a745' : '#dc3545',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span>{isConnected ? '🟢' : '🔴'}</span>
            {isConnected ? 'Live Updates Active' : 'Offline'}
          </span>
        </div>
        
        {myEvents.length > 0 ? (
          <div className="events-grid">
            {myEvents.map(event => (
              <div key={event.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ 
                    color: '#333', 
                    fontSize: '18px', 
                    fontWeight: 'bold', 
                    margin: 0,
                    flex: 1
                  }}>
                    {event.name}
                  </h3>
                  <span className="attendee-count">
                    Attendees: {getApprovedCount(event.id)}
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#888' }}>📅</span>
                    <span style={{ fontSize: '14px', color: '#555' }}>
                      {formatDate(event.date)} at {formatTime(event.time)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#888' }}>📍</span>
                    <span style={{ fontSize: '14px', color: '#555' }}>
                      {event.venue}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#888' }}>👥</span>
                    <span style={{ fontSize: '14px', color: '#555' }}>
                      {event.approved_count || 0} / {event.capacity} registered
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card">
            <p style={{ textAlign: 'center', color: '#666', margin: 0 }}>
              You haven't created any events yet.
            </p>
          </div>
        )}
      </section>

      {/* Real-time Update Notification */}
      {recentAction && (
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>✨</span>
          <span>Real-time update: Registration activity detected!</span>
        </div>
      )}

      {/* Pending Registrations Section */}
      <section>
        <h2 style={{ color: '#333', marginBottom: '20px', fontSize: '24px' }}>
          Pending Registrations
          {pendingRegistrations.length > 0 && (
            <span style={{ 
              marginLeft: '12px',
              backgroundColor: '#ffc107',
              color: '#856404',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {pendingRegistrations.length}
            </span>
          )}
        </h2>

        <div className="card">
          {pendingRegistrations.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Event Name</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRegistrations.map(registration => (
                    <tr key={registration.id}>
                      <td style={{ fontWeight: '500' }}>
                        {registration.studentName}
                      </td>
                      <td>
                        {registration.event_name || getEventName(registration.event_id)}
                      </td>
                      <td>
                        <span className="status-pending">
                          Pending
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-green"
                            onClick={() => handleApprove(registration.id)}
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                            disabled={loading}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-red"
                            onClick={() => handleReject(registration.id)}
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                            disabled={loading}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#666', margin: 0, padding: '20px' }}>
              No pending registrations at this time.
            </p>
          )}
        </div>
      </section>

      {/* Statistics Summary */}
      <section style={{ marginTop: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#007bff', fontSize: '32px', margin: '0 0 8px 0' }}>
              {myEvents.length}
            </h3>
            <p style={{ color: '#666', margin: 0 }}>Total Events</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#28a745', fontSize: '32px', margin: '0 0 8px 0' }}>
              {myEvents.reduce((total, event) => total + (event.approved_count || 0), 0)}
            </h3>
            <p style={{ color: '#666', margin: 0 }}>Total Registrations</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#ffc107', fontSize: '32px', margin: '0 0 8px 0' }}>
              {pendingRegistrations.length}
            </h3>
            <p style={{ color: '#666', margin: 0 }}>Pending Approvals</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OrganizerDashboard;
