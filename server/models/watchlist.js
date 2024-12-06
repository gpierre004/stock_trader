// models/watchlist.js
module.exports = (sequelize, DataTypes) => {
    const Watchlist = sequelize.define('Watchlist', {
    id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
    },
    date_added: {
    type: DataTypes.DATEONLY,
    allowNull: false
    },
    reason: DataTypes.TEXT,
    ticker: DataTypes.STRING(100),
    userid: DataTypes.INTEGER,
    currentPrice: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
    },
    weekHigh52: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
    },
    percentBelow52WeekHigh: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
    },
    avgClose: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
    },
    sector: {
    type: DataTypes.STRING(100),
    defaultValue: ''
    },
    priceWhenAdded: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
    },
    priceChange: DataTypes.DOUBLE,
    lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
    },
    interested: DataTypes.BOOLEAN,
    metrics: DataTypes.JSONB,
    industry: DataTypes.STRING(255),
    UserId: DataTypes.INTEGER
    }, {
    tableName: 'watchlists'
    });
    
    return Watchlist;
    };