// netlify/functions/api.js
const express = require('express');
const serverless = require('serverless-http');

const setup_app = require('./routers/setup')

const app = express();

// Middleware
app.use(express.json());

// Define your API routes on the router
router.get('/hello', (req, res) => {
  res.json({ message: "Hello from Express on Netlify Functions!" });
});

setup_app(app)

// Export the handler wrapped with serverless-http
module.exports.handler = serverless(app);
