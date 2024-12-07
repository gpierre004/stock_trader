const { Company, StockPrice } = require('../models');
const { Op } = require('sequelize');
const yahooFinance = require('yahoo-finance2').default;

const stockController = {
  getCompanies: async (req, res) => {
    try {
      const companies = await Company.findAll();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getStockPrices: async (req, res) => {
    try {
      const { ticker, startDate, endDate } = req.query;
      const prices = await StockPrice.findAll({
        where: {
          ticker,
          date: {
            [Op.between]: [startDate, endDate]
          }
        },
        order: [['date', 'ASC']]
      });
      res.json(prices);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateStockPrices: async (req, res) => {
    try {
      // Get all companies
      const companies = await Company.findAll({
        attributes: ['ticker'],
        raw: true
      });

      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

      // Delete records older than 5 years
      await StockPrice.destroy({
        where: {
          date: {
            [Op.lt]: fiveYearsAgo
          }
        }
      });

      const results = {
        success: [],
        failed: []
      };

      // Update each ticker
      for (const company of companies) {
        try {
          // Check if we have recent data
          const mostRecentPrice = await StockPrice.findOne({
            where: {
              ticker: company.ticker,
              date: {
                [Op.gte]: fiveYearsAgo
              }
            },
            order: [['date', 'DESC']]
          });

          if (mostRecentPrice) {
            // If we have recent data, just update the latest price
            const quote = await yahooFinance.quote(company.ticker);
            await StockPrice.create({
              ticker: company.ticker,
              date: new Date(),
              open: quote.regularMarketOpen,
              high: quote.regularMarketDayHigh,
              low: quote.regularMarketDayLow,
              close: quote.regularMarketPrice,
              volume: quote.regularMarketVolume,
              adjusted_close: quote.regularMarketPrice
            });
          } else {
            // If no recent data, fetch 5 years of history
            const queryOptions = {
              period1: fiveYearsAgo,
              period2: new Date(),
              interval: '1d'
            };

            const data = await yahooFinance.historical(company.ticker, queryOptions);
            
            // Process each day's data
            for (const quote of data) {
              await StockPrice.upsert({
                ticker: company.ticker,
                date: quote.date,
                open: quote.open,
                high: quote.high,
                low: quote.low,
                close: quote.close,
                volume: quote.volume,
                adjusted_close: quote.adjClose
              }, {
                where: {
                  ticker: company.ticker,
                  date: quote.date
                }
              });
            }
          }
          
          results.success.push(company.ticker);
        } catch (error) {
          results.failed.push({
            ticker: company.ticker,
            error: error.message
          });
        }
      }

      res.json({
        message: 'Stock price update completed',
        results
      });
    } catch (error) {
      console.error('Error updating stock prices:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = stockController;
