const { Watchlist, StockPrice, sequelize } = require('../models');
const { Op } = require('sequelize');
const cron = require('node-cron');

// Constants for watchlist criteria
const DAYS_THRESHOLD = 90;
const PRICE_DROP_THRESHOLD = 0.25;
const RECOVERY_THRESHOLD = 0.70;
const VOLUME_INCREASE_THRESHOLD = 1.5;
const WATCH_LIST_THRESHOLD = 0.25;
const TREND_PERIOD = 1080;

const watchlistController = {
    // Get watchlist items for a user
    getWatchlist: async (req, res) => {
        try {
            const userId = req.user.id;
            const watchlist = await Watchlist.findAll({
                where: { userid: userId }
            });
            res.json(watchlist);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Manually add to watchlist
    addToWatchlist: async (req, res) => {
        try {
            const userId = req.user.id;
            const { ticker, reason } = req.body;

            const watchlistItem = await Watchlist.create({
                userid: userId,
                ticker,
                reason,
                date_added: new Date()
            });

            res.status(201).json(watchlistItem);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Remove from watchlist
    removeFromWatchlist: async (req, res) => {
        try {
            const userId = req.user.id;
            const { ticker } = req.params;
            
            await Watchlist.destroy({
                where: {
                    userid: userId,
                    ticker: ticker
                }
            });
            
            res.json({ message: 'Successfully removed from watchlist' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Function to check if date is a business day
    isBusinessDay: (date) => {
        const day = date.getDay();
        return day !== 0 && day !== 6; // 0 is Sunday, 6 is Saturday
    },

    // Calculate moving average
    calculateMovingAverage: async (ticker, days) => {
        try {
            const prices = await StockPrice.findAll({
                where: { ticker },
                order: [['date', 'DESC']],
                limit: days
            });

            if (prices.length < days) return null;

            const sum = prices.reduce((acc, price) => acc + price.close, 0);
            return sum / days;
        } catch (error) {
            console.error(`Error calculating MA for ${ticker}:`, error);
            return null;
        }
    },

    // Main function to check stock criteria and update watchlist
    updateWatchlist: async () => {
        console.log('Starting watchlist update process...');
        try {
            // Get all unique tickers
            const tickers = await StockPrice.findAll({
                attributes: [[sequelize.fn('DISTINCT', sequelize.col('ticker')), 'ticker']],
                raw: true
            });

            for (const { ticker } of tickers) {
                try {
                    // Get current price data
                    const currentPriceData = await StockPrice.findOne({
                        where: { ticker },
                        order: [['date', 'DESC']]
                    });

                    if (!currentPriceData) continue;

                    // Get 52-week high
                    const yearAgo = new Date();
                    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
                    
                    const yearHighData = await StockPrice.findOne({
                        where: {
                            ticker,
                            date: {
                                [Op.gte]: yearAgo
                            }
                        },
                        order: [['high', 'DESC']]
                    });

                    if (!yearHighData) continue;

                    // Calculate price drop from 52-week high
                    const priceDropPercent = (yearHighData.high - currentPriceData.close) / yearHighData.high;

                    // Get average volume (30-day)
                    const avgVolumeData = await StockPrice.findAll({
                        where: { ticker },
                        order: [['date', 'DESC']],
                        limit: 30
                    });

                    const avgVolume = avgVolumeData.reduce((acc, data) => acc + data.volume, 0) / avgVolumeData.length;
                    const volumeIncrease = currentPriceData.volume / avgVolume;

                    // Get long-term trend
                    const trendMA = await watchlistController.calculateMovingAverage(ticker, TREND_PERIOD);

                    // Check if stock was recently added to watchlist
                    const lastAddedRecord = await Watchlist.findOne({
                        where: { ticker },
                        order: [['date_added', 'DESC']]
                    });

                    const recentlyAdded = lastAddedRecord && 
                        (new Date() - new Date(lastAddedRecord.date_added)) / (1000 * 60 * 60 * 24) < DAYS_THRESHOLD;

                    // Check all criteria
                    if (!recentlyAdded &&
                        priceDropPercent >= PRICE_DROP_THRESHOLD &&
                        currentPriceData.close >= (yearHighData.high * RECOVERY_THRESHOLD) &&
                        volumeIncrease >= VOLUME_INCREASE_THRESHOLD &&
                        currentPriceData.close < (yearHighData.high * (1 - WATCH_LIST_THRESHOLD)) &&
                        trendMA && currentPriceData.close > trendMA) {

                        // Add to watchlist if not already present
                        await Watchlist.findOrCreate({
                            where: { ticker },
                            defaults: {
                                date_added: new Date(),
                                currentPrice: currentPriceData.close,
                                weekHigh52: yearHighData.high,
                                percentBelow52WeekHigh: priceDropPercent * 100,
                                priceWhenAdded: currentPriceData.close,
                                lastUpdated: new Date(),
                                metrics: {
                                    volumeIncrease,
                                    trendMA
                                }
                            }
                        });

                        console.log(`Added ${ticker} to watchlist`);
                    }
                } catch (error) {
                    console.error(`Error processing ${ticker}:`, error);
                    continue;
                }
            }
            console.log('Watchlist update completed successfully');
        } catch (error) {
            console.error('Error in watchlist update process:', error);
        }
    },

    // Initialize the cron job
    initializeWatchlistCron: () => {
        // Schedule the cron job to run at 4:00 PM on business days
        cron.schedule('0 16 * * 1-5', async () => {
            const now = new Date();
            if (watchlistController.isBusinessDay(now)) {
                console.log('Starting scheduled watchlist update...');
                await watchlistController.updateWatchlist();
            }
        }, {
            timezone: "America/New_York"
        });
        console.log('Watchlist update scheduled for 4:00 PM ET on business days');
    }
};

module.exports = watchlistController;
