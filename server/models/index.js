const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/database').development;

// Create Sequelize instance with more detailed logging
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  logging: false, // Temporarily disable logging to reduce noise
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

// Import models
const Company = require('./company');
const StockPrice = require('./stockPrice');
const User = require('./user');
const Transaction = require('./transaction');
const Watchlist = require('./watchlist');

// Initialize models
const models = {
  Company: Company(sequelize, DataTypes),
  StockPrice: StockPrice(sequelize, DataTypes),
  User: User(sequelize, DataTypes),
  Transaction: Transaction(sequelize, DataTypes),
  Watchlist: Watchlist(sequelize, DataTypes)
};

// Set up associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;
models.testConnection = testConnection;

module.exports = models;
