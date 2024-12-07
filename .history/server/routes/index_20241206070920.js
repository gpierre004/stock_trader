// routes/index.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const stockController = require('../controllers/stockController');
const watchlistController = require('../controllers/watchlistController');
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');

// User routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Stock routes - protected
router.get('/companies', auth, stockController.getCompanies);
router.get('/stock-prices', auth, stockController.getStockPrices);
router.post('/stocks/update-prices', auth, stockController.updateStockPrices);

// Watchlist routes - protected
router.get('/watchlist', auth, watchlistController.getWatchlist);
router.post('/watchlist', auth, watchlistController.addToWatchlist);
router.delete('/watchlist/:ticker', auth, watchlistController.removeFromWatchlist);

// Transaction routes - protected
router.get('/transactions', auth, transactionController.getTransactions);
router.post('/transactions', auth, transactionController.createTransaction);

module.exports = router;
