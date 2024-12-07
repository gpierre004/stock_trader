// seeders/20231206-demo-stocks.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('companies', [
      {
        ticker: 'AAPL',
        name: 'Apple Inc.',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        ticker: 'MSFT',
        name: 'Microsoft Corporation',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        ticker: 'GOOGL',
        name: 'Alphabet Inc.',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // Add some stock prices
    await queryInterface.bulkInsert('stock_prices', [
      {
        ticker: 'AAPL',
        date: new Date(),
        open: 185.50,
        high: 186.20,
        low: 184.80,
        close: 185.75,
        volume: 52000000,
        adjusted_close: 185.75,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        ticker: 'MSFT',
        date: new Date(),
        open: 375.20,
        high: 376.80,
        low: 374.50,
        close: 376.25,
        volume: 25000000,
        adjusted_close: 376.25,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        ticker: 'GOOGL',
        date: new Date(),
        open: 135.80,
        high: 136.50,
