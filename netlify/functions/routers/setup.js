const auth_router = require('./auth');
const resources_router = require('./resources');
const privileges_router = require('./privileges');

/**
 * Sets up routers for the express app
 */
function setup_routers(app){
    app.use('/api/auth', auth_router);
    app.use('/api/privileges', privileges_router);
    app.use('/api/resources', resources_router)
}

module.exports = setup_routers