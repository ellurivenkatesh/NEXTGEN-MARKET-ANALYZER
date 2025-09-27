const express = require("express");
const router = express.Router();
const { getOverlap } = require("../controllers/overlapController");

// Mount at /api/overlap/:clientId
router.get("/:clientId", getOverlap);

module.exports = router;
