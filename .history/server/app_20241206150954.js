const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const routes = require('./routes');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',  // Default Vite port
    'http://localhost:5174',  // Alternative Vite port
    'http://localhost:3000'   // Other common development port
  ],
  credentials: true
}));

// General rate limiting - More lenient for development
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 2000, // allow 2000 requests per minute
  message: {
    status: 429,
    message: 'Too many requests, please try again later.',
    details: 'You have exceeded the general rate limit.'
  }
});

// Specific rate limiter for stock prices endpoint
const stockPricesLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 300, // 300 requests per minute for stock prices
  message: {
    status: 429,
    message: 'Too many stock price requests, please try again later.',
    details: 'Rate limit: 300 requests per minute for stock price data.'
  },
  keyGenerator: (req) => {
    // Use IP + endpoint as the key
    return req.ip + '_stock-prices';
  }
});

// Apply specific rate limiter to stock prices endpoint
app.use('/api/stock-prices', stockPricesLimiter);

// Apply general rate limiter to all other routes
app.use(generalLimiter);

// Utility middleware
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api', routes);

// Error handling with more detailed errors for development
app.use((err, req, res, next) => {
  console.error('Error details:', err);
  res.status(500).json({ 
    message: 'Server error', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
