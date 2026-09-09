import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from "formik";
import Emergency from '../smaller_components/Emergency'
import * as Yup from 'yup';

import '../css/dailycheckin.css'
import '../css/styles.css'

//the function that adds the daily checkin page
function DailyCheckin(){
    const navigate = useNavigate();

    const initialValues = Yup.object().shape({
        "mood" : "happy",
        "entry" : "",
    });

    const validationSchema = {

    }

    const [error, setError] = useState("")

    return<>
    <div class="full-height">

    <header class="app-header gradient-header">
        <div class="container">
        <div class="header-content">
            <button class="back-button" onClick={navigate('/home')} aria-label="Go to home page">
            ← Home
            </button>
            <h1 class="text-white">Daily Check-In</h1>
        </div>
        </div>
    </header>

    <main class="container" style={{flex: 1, paddingTop: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-xl)'}}>

        <section class="card fade-in">
            <h2 style={{fontSize: 'var(--font-size-md)', marginBottom: 'var(--spacing-sm)'}}>Choose an option</h2>
            <p style={{color: 'var(--dark-gray)', marginBottom: 'var(--spacing-md)'}}>
                Start a new daily entry or review your recent journal history.
            </p>

            <textarea>

            </textarea>

            <section class="mood-checkin mt-lg fade-in" style="animation-delay: 0.2s;">
                <h2 class="text-center mb-md">How are you feeling today?</h2>
                
                <div class="mood-selector" role="group" aria-label="Select your mood">
                    <button 
                    class="mood-btn happy" 
                    onclick="selectMood('happy')"
                    aria-label="Happy mood"
                    data-mood="happy"
                    >
                    😊
                    </button>
                    <button 
                    class="mood-btn neutral" 
                    onclick="selectMood('neutral')"
                    aria-label="Neutral mood"
                    data-mood="neutral"
                    >
                    😐
                    </button>
                    <button 
                    class="mood-btn sad" 
                    onclick="selectMood('sad')"
                    aria-label="Sad mood"
                    data-mood="sad"
                    >
                    ☹️
                    </button>
                </div>
            </section>

            <button onClick={async () => {navigate('/home-first-time')}} class="btn btn-primary btn-large" style={{width: '100%', marginBottom: 'var(--spacing-sm)'}}>
                Update Today's Entry
            </button>
        </section>

        <section id="historyCard" class="card history-shell" aria-live="polite">
        <h2 class="history-title">Last 10 Journal Entries</h2>
        <div id="historyList"></div>
        </section>

    </main>

    {<Emergency/>}

    <button onClick={navigate("/help")} class="help-fab pulse" aria-label="Get help now">
        <span style={{fontWeight: 700, fontSize: '18px'}}>HELP</span>
    </button>

  </div>
    
    </>
}

export default DailyCheckin