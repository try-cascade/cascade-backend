const express = require('express');
const router = express.Router();
const awsController = require('../controllers/aws.controllers')

// Get listing of clusters
// router.get('/clusters', awsController.clusters)

router.post('/bucket', awsController.createBucket)

router.post('/environment', awsController.addEnvironmentToBucket)

// router.get('/:app/environment/:env', awsController.environment)

router.post('/service', awsController.addServiceToBucket)

router.get('/:app/environment/:env/services', awsController.services)

module.exports = router