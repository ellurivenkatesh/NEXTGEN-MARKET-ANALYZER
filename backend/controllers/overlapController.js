const fs = require("fs");

// Load client data from JSON
const clients = JSON.parse(fs.readFileSync("data/portfolios.json", "utf-8"));
const CLIENTS = {};
clients.forEach(c => (CLIENTS[c.clientId] = c));

// Utility: calculate overlap between 2 funds
function fundOverlap(fundA, fundB) {
  const a = fundA.holdings;
  const b = fundB.holdings;
  const allStocks = new Set([...Object.keys(a), ...Object.keys(b)]);
  let sum = 0;
  for (let stock of allStocks) {
    sum += Math.min(a[stock] || 0, b[stock] || 0);
  }
  return sum;
}

// Controller: list clients
function getClients(req, res) {
  const clientList = clients.map(c => ({ clientId: c.clientId, currency: c.currency }));
  res.json({ clients: clientList });
}

// Controller: overlap analysis for one client
function getOverlap(req, res) {
  const clientId = req.params.clientId;
  const client = CLIENTS[clientId];
  if (!client) {
    return res.status(404).json({ error: "Client not found" });
  }

  const funds = client.funds;
  const overlaps = [];

  for (let i = 0; i < funds.length; i++) {
    for (let j = i + 1; j < funds.length; j++) {
      const ov = fundOverlap(funds[i], funds[j]);
      overlaps.push({
        fund_i: funds[i].fundCode,
        fund_j: funds[j].fundCode,
        overlap_pct: +(ov * 100).toFixed(2)
      });
    }
  }

  const avg =
    overlaps.length > 0
      ? overlaps.reduce((acc, r) => acc + r.overlap_pct, 0) / overlaps.length
      : 0;
  const score = +(100 - avg).toFixed(2);

  res.json({
    clientId,
    pairs: overlaps,
    average_overlap_pct: +avg.toFixed(2),
    overlap_score: score
  });
}

module.exports = { getOverlap, getClients };
