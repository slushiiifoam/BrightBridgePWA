import React, {useEffect, useContext} from 'react'
import {useNavigate} from 'react-router-dom'

import '../css/loginStyles.css'
import '../css/styles.css'

import Emergency from '../smaller_components/Emergency.js'

import {AuthContext} from '../helper/AuthContext.js'


//this is the page with the login logic
function Login() {

    const navigate = useNavigate();
    const { user, isInitialized } = useContext(AuthContext);

    useEffect(() =>{
      if (!isInitialized) return; // Wait until Netlify is ready

      if (window.location.pathname !== '/login') return;

        if (user) {
            // THE REACT WAY: The moment 'user' is no longer null, 
            // this useEffect fires and moves the user.
            const returnToken = localStorage.getItem('brightbridge_returning_user')

            const isReturningUser = returnToken && (returnToken === 'true');
            const destination = isReturningUser ? '/home' : '/home-first-time';
            
            if (!isReturningUser) {
                localStorage.setItem('brightbridge_returning_user', 'true');
            }
            window.location.assign(destination);
        }
      
    }, [user, isInitialized, navigate]);

    return <>
    <div className="gradient-bg full-height">
    <main className="container center-content" style={{flex: 1, justifyContent: "center"}}>
    
    <div className="login-card fade-in">
      <h1 className="text-center text-white mb-lg">Welcome to BrightBridge!</h1>

      <div className="container">
        <header>
          <div id="auth-controls"></div>
        </header>

        <main>
          <div id="auth-view" className="view">
            <button id="login-btn" className="btn btn-primary" 
              onClick={() => {window.netlifyIdentity.open()}}>Log In / Sign Up</button>
          </div>
        </main>
      </div>
      
      <div className="login-options mt-md">
        <p className="text-center text-white" style={{fontSize: 'var(--font-size-xs)'}}>
          Don't have an account? Your first login will create one.
        </p>
      </div>
      
    </div>
    
  </main>
  
  <Emergency/>
  </div>
    </>
}

export default Login