import React, {useEffect} from 'react'
import '../css/landingStyles.css'
import '../css/styles.css'
import Emergency from '../smaller_components/Emergency.js'
import { useNavigate } from 'react-router-dom'

//the page for the landing page 
function Greeting(){

    useEffect(()=>{
      document.body.style.opacity = '1';
      document.body.style.transition = 'opacity 0.3s ease';
    }, []);

    const navigate = useNavigate();

    function enterApp() {
      console.log("Entering App");
      setTimeout(() => {
        navigate('/login');
      }, 300);
    }

    return <>
    <div className="gradient-bg full-height full-width center-content">
        <main className="container center-content" style={{ flex: 1 }}>
          
    
        <div className="app-icon fade-in">
        <div className="icon-container">
            <svg className="app-logo" width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" rx="40" fill="#F5F5DC"/>
            <circle cx="100" cy="80" r="35" fill="#FFA500" opacity="0.9"/>
            <circle cx="100" cy="80" r="30" fill="#FF6B35"/>
            <line x1="100" y1="45" x2="100" y2="30" stroke="#FFA500" strokeWidth="3"/>
            <line x1="120" y1="50" x2="130" y2="40" stroke="#FFA500" strokeWidth="3"/>
            <line x1="80" y1="50" x2="70" y2="40" stroke="#FFA500" strokeWidth="3"/>
            <rect x="30" y="100" width="140" height="8" fill="#2C2C2C"/>
            <rect x="40" y="90" width="6" height="20" fill="#2C2C2C"/>
            <rect x="95" y="85" width="10" height="25" fill="#2C2C2C"/>
            <rect x="155" y="90" width="6" height="20" fill="#2C2C2C"/>
            <line x1="45" y1="90" x2="100" y2="85" stroke="#2C2C2C" strokeWidth="2"/>
            <line x1="100" y1="85" x2="158" y2="90" stroke="#2C2C2C" strokeWidth="2"/>
            <ellipse cx="100" cy="130" rx="60" ry="15" fill="#E85D8A" opacity="0.6"/>
            </svg>
        </div>
        </div>
        
        <button className="tap-enter-btn fade-in" onClick={enterApp} aria-label="Tap to enter BrightBridge app">
        <span className="tap-text">Tap to Enter</span>
        </button>

        
    
  </main>
  
  <Emergency/>
  </div>
    </>
}

export default Greeting