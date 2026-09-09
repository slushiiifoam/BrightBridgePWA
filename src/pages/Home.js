import React, { useEffect , useContext, useState} from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Emergency from '../smaller_components/Emergency.js'

import '../css/styles.css'
import '../css/homeStyles.css'

import {AuthContext} from '../helper/AuthContext.js'

//returns the home page of the pwa
function Home(){

    const navigate = useNavigate();
    const { user, isInitialized } = useContext(AuthContext);

    const [fullName, setFullName] = useState("");

    const logout = () => {
      setTimeout(() => {window.netlifyIdentity.logout()}, 100)};

    useEffect(() =>{

        if(!isInitialized)
            return;

        setTimeout(() => {
          setFullName(user?.user_metadata?.full_name || "Guest");
        }, 100);

        if (isInitialized && !user) {
            // THE REACT WAY: The moment 'user' is no longer null, 
            // this useEffect fires and moves the user.
            navigate('/login', { replace: true });
        }
      
    }, [user, isInitialized, navigate]);

    if (!isInitialized) return <div>Checking session...</div>;
  if (!user) return null; // Let the useEffect handle the redirect

    return<>
    <div className="full-height">
  
  <header className="app-header gradient-header">
    <div className="container">
      <div className="header-content">
        <h1 className="text-white">BrightBridge</h1>
        <p className="text-white" style={{opacity: 0.9, fontSize: 'var(--font-size-xs)'}}>
          Welcome back, {fullName}
        </p>

        <button id="logout-btn" type="button" onClick={logout}>Log Out</button>
      </div>
    </div>
  </header>
  
  <main className="container" style={{flex: 1, paddingTop: 'var(--spacing-lg)', paddingBottom: '100px'}}>
    
    <section className="daily-checkin-card card fade-in">
      <h2 style={{fontSize: 'var(--font-size-md)', marginBottom: 'var(--spacing-sm)'}}>
        Daily Check-In
      </h2>
      <p style={{color: 'var(--dark-gray)', marginBottom: 'var(--spacing-md)'}}>
        How are you feeling today?
      </p>
      
      <div className="mood-selector" style={{justifyContent: 'flex-start'}}>
        <button className="mood-btn happy" onClick={navigate('/dailycheckin')} aria-label="Happy">
          Log/Update Daily Mood Journal
        </button>
      </div>
    </section>
    
    <nav className="main-nav mt-lg" aria-label="Main navigation">
      <ul className="nav-list">
        
        <li className="nav-item fade-in" style={{animationDelay: '0.1s'}}>
          <Link to='/grounding' className="nav-link">
            <span className="nav-icon">🧘</span>
            <span>Grounding Tools</span>
          </Link>
        </li>
        
        <li className="nav-item fade-in" style={{animationDelay: '0.2s'}}>
          <Link to="/resources" className="nav-link">
            <span className="nav-icon">📚</span>
            <span>Resources</span>
          </Link>
        </li>
        
        <li className="nav-item fade-in" style={{animationDelay: '0.3s'}}>
          <Link to="/dailycheckin" className="nav-link">
            <span className="nav-icon">✍️</span>
            <span>Daily Check-In</span>
          </Link>
        </li>
        
        <li className="nav-item fade-in" style={{animationDelay: '0.4s'}}>
          <Link to="/conflict" className="nav-link">
            <span className="nav-icon">🤝</span>
            <span>Conflict De-Escalation</span>
          </Link>
        </li>
        
        <li className="nav-item fade-in" style={{animationDelay: '0.5s'}}>
          <Link to="/microskills" className="nav-link">
            <span className="nav-icon">💬</span>
            <span>Relationship Microskills</span>
          </Link>
        </li>
        
      </ul>
    </nav>
    
    <section className="info-section mt-lg">
      <div className="card" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white'}}>
        <h3 style={{color: 'white', marginBottom: 'var(--spacing-xs)'}}>Need Help Right Now?</h3>
        <p style={{opacity: '0.95', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--spacing-sm)'}}>
          Tap the red HELP button anytime for immediate support and resources.
        </p>

        
      </div>
    </section>
    
  </main>
  
  <Link to="/help" className="help-fab pulse" aria-label="Get help now">
    <span style={{fontWeight: 700, fontSize: '18px'}}>HELP</span>
  </Link>

  <Emergency/>
  </div>
    </>

}

export default Home