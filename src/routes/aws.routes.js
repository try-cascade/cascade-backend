const express = require('express');
const router = express.Router();
const awsController = require('../controllers/aws.controllers')

// Get listing of clusters
// router.get('/clusters', awsController.clusters)

router.post('/bucket', awsController.createBucket)

router.get('/applications', awsController.applications)

router.post('/environment', awsController.addEnvironmentToBucket)

// router.get('/:app/environment/:env', awsController.environment)

router.post('/service', awsController.addServiceToBucket)

router.get('/services', awsController.services)

router.get('/website', awsController.website)

module.exports = router