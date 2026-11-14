// netlify/functions/api.js
import express from 'express'
import serverless from 'serverless-http'

import setup_infrastructure from './infrastructure/setup.js'
import setup_routers from './routers/setup.js'

const app = express();
const router = express.Router();

// Middleware
app.use(express.json());

// Define your API routes on the router
router.get('/', (req, res) => {
  res.json({ message: "Hello from Express on Netlify Functions!" });
});

//sets up routers
setup_infrastructure(app);
app.use(router);
setup_routers(app);

// Export the handler wrapped with serverless-http
export const handler = serverless(app);
