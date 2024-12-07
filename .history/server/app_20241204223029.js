// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const routes = require('./routes');
const { sequelize, testConnection } = require('./models');
const stockController = require('./controllers/stockController');
const watchlistController = require('./controllers/watchlistController');

const app = express();

// Enable trust proxy - this is required when running behind a reverse proxy
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api', routes);

// Cron job for updating stock prices
// Runs every hour from 9:30 AM to 4:00 PM ET on weekdays (Monday to Friday)
cron.schedule('30 9-16 * * 1-5', async () => {
  console.log('Running scheduled stock price update...');
  try {
    // Create a mock request and response object for the controller
    const mockReq = {
      user: { id: 'SYSTEM' }  // Identify the request as system-generated
    };
    const mockRes = {
      json: (data) => {
        console.log('Stock price update completed:', data);
      },
      status: (code) => ({
        json: (data) => {
          console.error('Stock price update failed:', data);
        }
      })
    };

    await stockController.updateStockPrices(mockReq, mockRes);
  } catch (error) {
    console.error('Failed to update stock prices:', error);
  }
}, {
  timezone: "America/New_York"  // Ensure the schedule runs in ET
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Database connection and server start
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Sync database models without altering existing tables
    await sequelize.sync({ 
      alter: {
        drop: false // Prevent dropping existing columns
      }
    });
    console.log('Database models synchronized');

    // Initialize watchlist cron job
    watchlistController.initializeWatchlistCron();

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log('Stock price updates scheduled for weekdays 9:30 AM - 4:00 PM ET');
      console.log('Watchlist updates scheduled for weekdays 4:00 PM ET');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
