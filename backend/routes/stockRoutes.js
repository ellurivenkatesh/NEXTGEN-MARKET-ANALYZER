const express = require('express');
const router = express.Router();
const { getStockAnalysis } = require('../controllers/stockController');

router.get('/:stockSymbol', getStockAnalysis);

module.exports = router;
