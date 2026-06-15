const express = require('express');
const transactionController = require('./transaction.controller');
const authMiddleware = require('../auth/auth.middleware');
const transactionValidation = require('./transaction.validators');

const router = express.Router();

// Apply authMiddleware globally to all transaction routes
router.use(authMiddleware);

router.get('/', transactionValidation.query, transactionController.getTransactions);
router.get('/summary', transactionController.getTransactionSummary);
router.get('/:id', transactionController.getTransactionById);
router.post('/', transactionValidation.create, transactionController.createTransaction);
router.put('/:id', transactionValidation.update, transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
