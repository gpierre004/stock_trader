// models/transaction.js
module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define('Transaction', {
        purchase_id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        ticker: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        purchase_date: DataTypes.DATEONLY,
        quantity: DataTypes.DECIMAL(10, 5),
        type: DataTypes.CHAR(4),
        comment: DataTypes.STRING(200),
        purchase_price: DataTypes.DECIMAL(10, 2),
        portfolio_id: DataTypes.INTEGER,
        current_price: DataTypes.DECIMAL(10, 2),
        AccountId: DataTypes.INTEGER,
        Description: DataTypes.STRING(200),
        remaining_shares: {
            type: DataTypes.DECIMAL(10, 5),
            defaultValue: null
        },
        cost_basis: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: null
        },
        realized_gain_loss: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: null
        }
    }, {
        tableName: 'transactions'
    });
    return Transaction;
    };
    