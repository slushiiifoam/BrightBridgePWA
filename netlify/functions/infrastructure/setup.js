import cookieParser from 'cookie-parser';
import hpp from 'hpp'
import express from 'express'

import setup_helmet from './helmet.js';
//import setup_cors from './cors.js';
import limiter from './ratelimiter.js'

function setup_infrastructure(app){
    app.set('trust proxy', 1);
    //setup_cors(app);
    setup_helmet(app);
    app.use(limiter);
    app.use(express.json({limit: '50kb'}));
    app.use(cookieParser());
    app.use(hpp());
};

export default setup_infrastructure;