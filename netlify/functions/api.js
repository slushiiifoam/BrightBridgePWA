// netlify/functions/api.js
import { settings } from './infrastructure/settings.js';
import express from 'express'
import serverless from 'serverless-http'

import setup_infrastructure from './infrastructure/setup.js'
import setup_routers from './routers/setup.js'

import { setup_error_handling } from './infrastructure/error_handler.js'

const app = express();
const router = express.Router();

// Define your API routes on the router
router.get('/', (req, res) => {
  res.json({ message: "Hello from Express on Netlify Functions!" });
});

//sets up routers
setup_infrastructure(app);
app.use('/api', router);
setup_routers(app);

setup_error_handling(app);

// Export the handler wrapped with serverless-http
export const handler = serverless(app);
