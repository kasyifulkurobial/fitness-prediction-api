const express = require('express');
const multer = require('multer');
const router = express.Router();
const { 
  getFitnessData, 
  getMetadata, 
  getStatistics, 
  uploadCSVData 
} = require('../controllers/dataController');

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// GET /api/data/fitness - Get fitness dataset
router.get('/fitness', getFitnessData);

// GET /api/data/metadata - Get metadata
router.get('/metadata', getMetadata);

// GET /api/data/statistics - Get dataset statistics
router.get('/statistics', getStatistics);

// POST /api/data/upload - Upload CSV data
router.post('/upload', upload.single('csvFile'), uploadCSVData);

module.exports = router;