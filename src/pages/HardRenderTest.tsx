
import React, { useState } from 'react';

export default function HardRenderTest() {
  const [count, setCount] = useState(0);
  const [timestamp] = useState(new Date().toISOString());

  const handleInteract = () => {
    console.log("HardRenderTest: Interaction verified");
    setCount(c => c + 1);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'white',
      color: 'black',
      zIndex: 999999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      padding: '20px',
      overflow: 'auto'
    }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px', color: 'green' }}>RENDER OK</h1>
      
      <div style={{ border: '2px solid black', padding: '20px', borderRadius: '8px' }}>
        <p><strong>Status:</strong> Component Mounted Successfully</p>
        <p><strong>Timestamp:</strong> {timestamp}</p>
        <p><strong>Interaction Count:</strong> {count}</p>
        
        <button 
          onClick={handleInteract}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: 'black',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Test Interaction (Click Me)
        </button>
      </div>

      <div style={{ marginTop: '20px', maxWidth: '600px', fontSize: '14px', color: '#666' }}>
        <p>If you see this screen, React is working and the issue lies within the Context Providers or Layout components.</p>
        <p>Navigate back to root (/) to attempt loading the main app.</p>
      </div>
    </div>
  );
}
