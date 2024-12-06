const { Transaction } = require('../models');

const transactionController = {
  getTransactions: async (req, res) => {
    try {
      const userId = req.user.id;
      const transactions = await Transaction.findAll({
        where: { portfolio_id: userId }
      });
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  createTransaction: async (req, res) => {
    try {
      const userId = req.user.id;
      const {
        ticker,
        quantity,
        type,
        purchase_price,
        purchase_date,
        comment
      } = req.body;

      const transaction = await Transaction.create({
        portfolio_id: userId,
        ticker,
        quantity,
        type,
        purchase_price,
        purchase_date,
        comment
      });

      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = transactionController;
