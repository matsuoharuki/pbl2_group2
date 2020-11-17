const express = require('express');
const router = express.Router();
const SpotController = require('./spotController');
const spotController = new SpotController();

router.post("/register",spotController.saveSpot);
router.get("/search",spotController.search);

module.exports = router;