import React from 'react'
import './css/styles.css';
import { AuthProvider} from './helper/AuthContext.js'
/* Not using imports cause builds to fail, Add Link later*/
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'

import Conflict from './pages/Conflict.js'
import DailyCheckin from './pages/DailyCheckin.js'
import Greeting from './pages/Greeting.js'
import Grounding from './pages/Grounding.js'
import Help from './pages/Help.js'
import Home from './pages/Home.js'
import HomeFirstTime from './pages/Home-first-time.js'
import Login from './pages/Login.js'
import MicroSkills from './pages/Microskills.js'
import Resources from './pages/Resources.js'

function App() {

  return (

    <div className="App">
      <AuthProvider>
      <Router>
       
        <div className = "navBox">
      
        </div>

        <Routes>
          <Route path = "/" element = {<Greeting/>}/>

          <Route path = '/conflict' element = {<Conflict/>}/>
          <Route path = "/dailycheckin" element = {<DailyCheckin/>}/>
          <Route path = "/grounding" element = {<Grounding/>}/>
          <Route path = "/help" element = {<Help/>}/>
          <Route path = '/home' element = {<Home/>}/>
          <Route path = '/home-first-time' element = {<HomeFirstTime/>}/>
          <Route path = '/login' element = {<Login/>}/>
          <Route path = "/microskills" element = {<MicroSkills/>}/>
          <Route path = "/resources" element = {<Resources/>}/>

          <Route path="/.netlify/*" element={null} />
          
        </Routes>
      </Router>

      </AuthProvider>
      
    </div>
  );
}

export default App;
