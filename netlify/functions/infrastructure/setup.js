import limiter from './ratelimiter.js'
import cookieParser from 'cookie-parser';

function setup_infrastructure(app){
    app.use(limiter);
    app.use(cookieParser())
};

export default setup_infrastructure;