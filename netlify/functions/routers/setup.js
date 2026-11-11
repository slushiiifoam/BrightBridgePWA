import express from 'express';
import auth_router from './auth.js';
import resources_router from './resources.js';
import privileges_router from './privileges.js';
import journal_router from './journals.js';

import { verifyAuthCookie } from '../infrastructure/cookie_processor.js';

/**
 * 
 * @param {*} app 
 */
function setup_public_routers(app){
    app.use('/api/auth', auth_router);
};

/**
 * 
 * @param {*} app 
 */
function setup_protected_routers(app){
// Create a parent protected router
  const apiProtectedRouter = express.Router();
  apiProtectedRouter.use(verifyAuthCookie);

  // Mount sub-routers on the protected router
  apiProtectedRouter.use('/privileges', privileges_router);
  apiProtectedRouter.use('/resources', resources_router);
  apiProtectedRouter.use('/journal', journal_router);

  // Mount parent protected router to the main app
  app.use('/api', apiProtectedRouter);

};

/**
 * 
 * @param {*} app 
 */
function setup_routers(app) {
  // Public routes
  setup_public_routers(app);

  //protected routers
  setup_protected_routers(app);
}

export default setup_routers;