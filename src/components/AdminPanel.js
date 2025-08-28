import React, { useState } from 'react';

const AdminPanel = ({ events, onCreateEvent, onUpdateEvent, onDeleteEvent, getApprovedCount, organizers }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    shortDescription: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    capacity: '',
    organizerId: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      shortDescription: '',
      description: '',
      date: '',
      time: '',
      venue: '',
      capacity: '',
      organizerId: ''
    });
    setIsCreating(false);
    setEditingEvent(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const eventData = {
      ...formData,
      capacity: parseInt(formData.capacity),
      organizerId: formData.organizerId
    };

    if (editingEvent) {
      onUpdateEvent(editingEvent.id, eventData);
    } else {
      onCreateEvent(eventData);
    }
    
    resetForm();
  };

  const startEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      shortDescription: event.short_description,
      description: event.description,
      date: event.date,
      time: event.time,
      venue: event.venue,
      capacity: event.capacity.toString(),
      organizerId: event.organizer_id || ''
    });
    setIsCreating(true);
  };

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

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: '#333', margin: 0, fontSize: '24px' }}>
          Event Management
        </h2>
        <button 
          className="btn btn-primary"
          onClick={() => setIsCreating(true)}
          disabled={isCreating}
        >
          + Create New Event
        </button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="card" style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '20px', color: '#333' }}>
            {editingEvent ? 'Edit Event' : 'Create New Event'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label htmlFor="name">Event Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="venue">Venue *</label>
                <input
                  type="text"
                  id="venue"
                  name="venue"
                  className="form-control"
                  value={formData.venue}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="date">Date *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  className="form-control"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="time">Time *</label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  className="form-control"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="capacity">Capacity *</label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  className="form-control"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="organizerId">Assign Organizer *</label>
                <select
                  id="organizerId"
                  name="organizerId"
                  value={formData.organizerId}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                >
                  <option value="">Select an organizer...</option>
                  {organizers && organizers.map(organizer => (
                    <option key={organizer.id} value={organizer.id}>
                      {organizer.name} ({organizer.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="shortDescription">Short Description *</label>
              <input
                type="text"
                id="shortDescription"
                name="shortDescription"
                className="form-control"
                value={formData.shortDescription}
                onChange={handleInputChange}
                maxLength="100"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Full Description *</label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="btn" 
                onClick={resetForm}
                style={{ backgroundColor: '#6c757d', color: 'white' }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingEvent ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      <div className="card">
        <h3 style={{ marginBottom: '20px', color: '#333' }}>All Events</h3>
        
        {events.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Date & Time</th>
                  <th>Venue</th>
                  <th>Registrations</th>
                  <th>Capacity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => {
                  const registered = getApprovedCount(event.id);
                  const utilizationRate = (registered / event.capacity * 100).toFixed(1);
                  
                  return (
                    <tr key={event.id}>
                      <td style={{ fontWeight: '500' }}>
                        <div>
                          <div>{event.name}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {event.short_description}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '14px' }}>
                          <div>{formatDate(event.date)}</div>
                          <div style={{ color: '#666' }}>{formatTime(event.time)}</div>
                        </div>
                      </td>
                      <td>{event.venue}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="attendee-count">
                            {registered}
                          </span>
                          <span style={{ 
                            fontSize: '12px', 
                            color: utilizationRate > 80 ? '#28a745' : utilizationRate > 50 ? '#ffc107' : '#6c757d' 
                          }}>
                            ({utilizationRate}%)
                          </span>
                        </div>
                      </td>
                      <td>{event.capacity}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-primary"
                            onClick={() => startEdit(event)}
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-red"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete "${event.name}"?`)) {
                                onDeleteEvent(event.id);
                              }
                            }}
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#666', margin: 0, padding: '20px' }}>
            No events found. Create your first event to get started.
          </p>
        )}
      </div>

      {/* Statistics */}
      <div style={{ marginTop: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#007bff', fontSize: '32px', margin: '0 0 8px 0' }}>
              {events.length}
            </h3>
            <p style={{ color: '#666', margin: 0 }}>Total Events</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#28a745', fontSize: '32px', margin: '0 0 8px 0' }}>
              {events.reduce((total, event) => total + getApprovedCount(event.id), 0)}
            </h3>
            <p style={{ color: '#666', margin: 0 }}>Total Registrations</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#ffc107', fontSize: '32px', margin: '0 0 8px 0' }}>
              {events.reduce((total, event) => total + event.capacity, 0)}
            </h3>
            <p style={{ color: '#666', margin: 0 }}>Total Capacity</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#17a2b8', fontSize: '32px', margin: '0 0 8px 0' }}>
              {events.length > 0 ? 
                ((events.reduce((total, event) => total + getApprovedCount(event.id), 0) / 
                  events.reduce((total, event) => total + event.capacity, 0)) * 100).toFixed(1) 
                : '0.0'}%
            </h3>
            <p style={{ color: '#666', margin: 0 }}>Avg Utilization</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
