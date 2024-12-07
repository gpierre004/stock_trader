const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Basic test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

module.exports = router;
