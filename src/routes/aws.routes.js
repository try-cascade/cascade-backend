const express = require('express');
const router = express.Router();
const awsController = require('../controllers/aws.controllers')

// Get listing of clusters
router.get('/clusters', awsController.clusters)

router.post('/bucket', awsController.createBucket)


module.exports = router