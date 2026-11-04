const limiter = require('./ratelimiter')

function setup_infrastructure(app){
    app.use(limiter);
};

module.exports = setup_infrastructure