import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const getTitle = () => {
    if (location.pathname === '/events') return 'Campus Events';
    if (location.pathname.startsWith('/events/')) return 'Event Details';
    if (location.pathname === '/dashboard') return 'Organizer Dashboard';
    if (location.pathname === '/admin') return 'Admin Panel';
    return 'Campus Events';
  };

  const getNavigation = () => {
    if (user.role === 'student') {
      return (
        <button
          className="btn"
          onClick={() => navigate('/events')}
          style={{
            marginRight: '12px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.3)'
          }}
        >
          Events
        </button>
      );
    }
    if (user.role === 'organizer') {
      return (
        <button
          className="btn"
          onClick={() => navigate('/dashboard')}
          style={{
            marginRight: '12px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.3)'
          }}
        >
          Dashboard
        </button>
      );
    }
    if (user.role === 'admin') {
      return (
        <div style={{ display: 'flex', gap: '8px', marginRight: '12px' }}>
          <button
            className="btn"
            onClick={() => navigate('/admin')}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.3)',
              marginRight: '8px'
            }}
          >
            Admin Panel
          </button>
          <button
            className="btn"
            onClick={() => navigate('/events')}
            style={{
              fontSize: '13px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.3)'
            }}
          >
            View Events
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <header className="header">
      <div className="header-content">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1>{getTitle()}</h1>
          <span style={{
            marginLeft: '16px',
            padding: '6px 14px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: '#ffffff',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}: {user.name}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {getNavigation()}
          <button
            className="btn"
            onClick={handleLogout}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.3)'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
