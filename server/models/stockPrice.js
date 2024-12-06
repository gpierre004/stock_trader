// models/stockPrice.js
module.exports = (sequelize, DataTypes) => {
    const StockPrice = sequelize.define('StockPrice', {
    id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
    },
    date: {
    type: DataTypes.DATE,
    allowNull: false
    },
    open: DataTypes.DOUBLE,
    high: DataTypes.DOUBLE,
    low: DataTypes.DOUBLE,
    close: DataTypes.DOUBLE,
    volume: DataTypes.BIGINT,
    adjusted_close: DataTypes.DOUBLE,
    ticker: {
    type: DataTypes.STRING(10),
    allowNull: false
    },
    change: {
    type: DataTypes.VIRTUAL,
    get() {
    return this.close - this.open;
    }
    }
    }, {
    tableName: 'stock_prices'
    });
    
    return StockPrice;
    };