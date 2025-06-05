const express = require('express');
const router = express.Router();
const { validateApiSpec } = require('../middleware/validators');
const apiController = require('../controllers/apiController');
const petController = require('../controllers/petController');

// Pet Store API Routes
router.get('/pets', petController.getAllPets);
router.post('/pets', petController.createPet);
router.get('/pets/:petId', petController.getPetById);

// Route to evaluate an API specification
router.post('/evaluate', validateApiSpec, apiController.evaluateApi);

// Route to get evaluation history
router.get('/history', apiController.getEvaluationHistory);

// Route to get a specific evaluation result
router.get('/evaluation/:id', apiController.getEvaluationResult);

module.exports = router; 