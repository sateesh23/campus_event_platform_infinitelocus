import React from 'react';

const DemoNotice = () => {
  // Only show in production
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <div style={{
      backgroundColor: '#fff3cd',
      color: '#856404',
      padding: '12px 16px',
      borderLeft: '4px solid #ffc107',
      margin: '16px',
      borderRadius: '4px',
      fontSize: '14px',
      textAlign: 'center'
    }}>
      <strong>���� Demo Mode:</strong> This is a frontend demonstration. 
      Backend integration required for full functionality.
      <br />
      <small>Login with: admin@campus.edu / CampusAdmin2024!</small>
    </div>
  );
};

export default DemoNotice;
