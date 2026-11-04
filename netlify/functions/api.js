// netlify/functions/api.js
const express = require('express');
const serverless = require('serverless-http');

const setup_infrastructure = require('./infrastructure/ratelimiter')
const setup_routers = require('./routers/setup')

const app = express();

// Middleware
app.use(express.json());

// Define your API routes on the router
router.get('/', (req, res) => {
  res.json({ message: "Hello from Express on Netlify Functions!" });
});

//sets up routers
setup_routers(app);
setup_infrastructure(app);

// Export the handler wrapped with serverless-http
module.exports.handler = serverless(app);
