const express = require('express');
const router = express.Router();
const { validatePredictionInput } = require('../middleware/validation');
const { 
  predictFitness, 
  getPredictionHistory, 
  getDetailedAnalysis 
} = require('../controllers/predictionController');

// POST /api/prediction/predict - Main prediction endpoint
router.post('/predict', validatePredictionInput, predictFitness);

// GET /api/prediction/history - Get prediction history
router.get('/history', getPredictionHistory);

// GET /api/prediction/:predictionId - Get detailed analysis
router.get('/:predictionId', getDetailedAnalysis);

module.exports = router;