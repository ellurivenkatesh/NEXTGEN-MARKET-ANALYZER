const fs = require('fs');
const path = require('path');

// Load stock data once at startup
const stockFilePath = path.join(__dirname, '..', 'data', 'StockTickerSymbols.json');
console.log("Stock JSON path:", stockFilePath);

let allStocksArray = [];
try {
  const rawData = fs.readFileSync(stockFilePath, 'utf-8');
  allStocksArray = JSON.parse(rawData);
  console.log("Loaded stock symbols:", allStocksArray.map(s => s.stockSymbol));
} catch (err) {
  console.error("Error reading stock JSON file:", err);
}

// Rule engine to generate feedback and summary
function generateFeedback(parameters) {
  const feedback = {};

  // 1. P/E Ratio
  const pe = parameters.priceEarningsRatio;
  if (pe < 15) feedback.priceEarningsRatio = `The P/E ratio of ${pe} suggests the stock is cheap relative to earnings.`;
  else if (pe <= 30) feedback.priceEarningsRatio = `The P/E ratio of ${pe} is fairly typical.`;
  else feedback.priceEarningsRatio = `The P/E ratio of ${pe} indicates the stock is relatively expensive compared to its earnings.`;

  // 2. EPS
  const eps = parameters.earningsPerShare;
  if (eps < 1) feedback.earningsPerShare = `The EPS of ${eps} is low; profitability may be a concern.`;
  else if (eps < 5) feedback.earningsPerShare = `The EPS of ${eps} shows modest profitability.`;
  else feedback.earningsPerShare = `The EPS of ${eps} is a strong indicator of the company's profitability.`;

  // 3. Dividend Yield
  const div = parameters.dividendYield;
  if (div < 1) feedback.dividendYield = `The dividend yield of ${div}% is lower than the market average.`;
  else if (div <= 3) feedback.dividendYield = `The dividend yield of ${div}% is around the market norm.`;
  else feedback.dividendYield = `The dividend yield of ${div}% is attractive for income focused investors.`;

  // 4. Market Cap
  const mc = parameters.marketCap;
  const trillion = 1e12;
  if (mc >= 500 * trillion) feedback.marketCap = `The market cap of $${(mc/trillion).toFixed(2)} trillion makes it one of the world’s giants.`;
  else if (mc >= 100 * trillion) feedback.marketCap = `The market cap of $${(mc/trillion).toFixed(2)} trillion indicates a very large, stable company.`;
  else feedback.marketCap = `The market capitalization of $${(mc/trillion).toFixed(2)} trillion indicates a sizable player.`;

  // 5. Debt to Equity
  const de = parameters.debtToEquityRatio;
  if (de < 0.5) feedback.debtToEquityRatio = `The debt to equity ratio of ${de} suggests very little leverage.`;
  else if (de <= 1.5) feedback.debtToEquityRatio = `The debt to equity ratio of ${de} suggests a moderate level of leverage.`;
  else feedback.debtToEquityRatio = `The debt to equity ratio of ${de} indicates high leverage; watch for risk.`;

  // 6. ROE
  const roe = parameters.returnOnEquity * 100;
  if (roe < 8) feedback.returnOnEquity = `The ROE of ${roe}% is below average.`;
  else if (roe <= 15) feedback.returnOnEquity = `The ROE of ${roe}% is healthy.`;
  else feedback.returnOnEquity = `The ROE of ${roe}% is very strong, showing efficient profit generation.`;

  // 7. ROA
  const roa = parameters.returnOnAssets * 100;
  if (roa < 5) feedback.returnOnAssets = `The ROA of ${roa}% is modest.`;
  else if (roa <= 10) feedback.returnOnAssets = `The ROA of ${roa}% indicates efficient asset utilization.`;
  else feedback.returnOnAssets = `The ROA of ${roa}% is excellent, showing superb asset productivity.`;

  // 8. Current Ratio
  const cr = parameters.currentRatio;
  if (cr < 1) feedback.currentRatio = `The current ratio of ${cr} signals potential short term liquidity issues.`;
  else if (cr <= 2) feedback.currentRatio = `The current ratio of ${cr} suggests the company has a good short term liquidity position.`;
  else feedback.currentRatio = `The current ratio of ${cr} indicates a very comfortable liquidity cushion.`;

  // 9. Quick Ratio
  const qr = parameters.quickRatio;
  if (qr < 1) feedback.quickRatio = `The quick ratio of ${qr} may be insufficient for immediate obligations.`;
  else if (qr <= 2) feedback.quickRatio = `The quick ratio of ${qr} indicates a strong ability to meet short term obligations.`;
  else feedback.quickRatio = `The quick ratio of ${qr} shows an exceptionally strong liquidity position.`;

  // 10. Book Value Per Share
  const bv = parameters.bookValuePerShare;
  feedback.bookValuePerShare = `The book value per share of ${bv} is a measure of the company's net asset value on a per share basis.`;

  // Summary
  const summaryParts = [
    feedback.priceEarningsRatio,
    feedback.earningsPerShare,
    feedback.returnOnEquity,
    feedback.returnOnAssets,
    feedback.currentRatio,
    feedback.quickRatio,
    feedback.debtToEquityRatio,
    feedback.dividendYield,
    feedback.marketCap
  ];
  const summary = summaryParts.join(' ');

  return { feedback, summary };
}

// Controller: GET /api/stock/:stockSymbol
function getStockAnalysis(req, res) {
  const { stockSymbol } = req.params;
  if (!stockSymbol) return res.status(400).json({ error: "stockSymbol is required" });

  const stockData = allStocksArray.find(s => s.stockSymbol === stockSymbol);
  if (!stockData) return res.status(404).json({ error: "Stock not found" });

  const { feedback, summary } = generateFeedback(stockData.parameters);

  res.status(200).json({
    stockSymbol,
    feedback,
    summary
  });
}

module.exports = { getStockAnalysis };
