// Vercel Serverless Function Handler
// This file acts as the entry point for all API routes
// Routes all /api/* requests to the Express backend

const app = require('../backend/server');

// Export the Express app as a serverless function
module.exports = app;
