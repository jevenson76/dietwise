import React from 'react';
import ReactDOM from 'react-dom/client';

const TestApp = () => {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #4ade80, #3b82f6, #a855f7)',
      color: 'white',
      fontSize: '3rem',
      fontWeight: 'bold'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1>DietWise Splash Screen</h1>
        <p style={{ fontSize: '1.5rem' }}>If you see this, React is working!</p>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<TestApp />);// TODO: this should fail deploy
