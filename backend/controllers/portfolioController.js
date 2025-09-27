const fs = require('fs');
const path = require('path');

const getPortfolioAnalysis = (req, res) => {
  const { clientId } = req.params;
  const filePath = path.join(__dirname, '..', 'data', 'portfolios.json');
  
  try {
    const fileData = fs.readFileSync(filePath);
    const clients = JSON.parse(fileData);

    const client = clients.find(c => c.clientId === clientId);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Compute total portfolio value
    const totalValue = client.funds.reduce((sum, fund) => sum + fund.amount, 0);

    // Compute sector weights
    const sectorWeights = {};
    client.funds.forEach(fund => {
      const fundShare = fund.amount / totalValue;
      Object.entries(fund.sectors).forEach(([sector, weight]) => {
        if (!sectorWeights[sector]) sectorWeights[sector] = 0;
        sectorWeights[sector] += fundShare * weight;
      });
    });

    // Compute HHI and Sector Score
    let hhi = 0;
    const sectorDiversification = {};
    Object.entries(sectorWeights).forEach(([sector, weight]) => {
      const percent = +(weight * 100).toFixed(2); // for readable %
      sectorDiversification[sector] = percent;
      hhi += Math.pow(weight, 2);
    });

    const sectorScore = +((1 - hhi) * 100).toFixed(2);

    // Build result object
    const result = {
      portfolioAnalysis: {
        totalValue,
        sectorDiversification,
        sectorScore, // dynamically computed
        riskLevel: "Moderate",
        performance: {
          oneYearReturn: 15.0,
          threeYearReturn: 20.0,
          fiveYearReturn: 25.0
        }
      },
      possibleDiversification: [
        {
          sector: "Consumer Staples",
          recommendation: "Consider adding stocks or funds in the Consumer Staples sector to balance your portfolio."
        },
        {
          sector: "Utilities",
          recommendation: "Investing in Utilities can provide stable dividends and lower volatility."
        }
      ],
      traderType: "Growth Investor",
      summary: `Your portfolio is mostly concentrated in ${Object.entries(sectorDiversification)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([sector]) => sector)
        .join(" and ")} sectors. Consider diversifying into other sectors to reduce risk.`
    };

    res.status(200).json(result);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getPortfolioAnalysis };
