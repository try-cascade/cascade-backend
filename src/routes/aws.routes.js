const express = require('express');
const router = express.Router();
const awsController = require('../controllers/aws.controllers');
const { getAppEnvNames } = require('../utils/middleware');

router.post('/bucket', awsController.createBucket);

router.get('/applications', getAppEnvNames, awsController.applications);

router.post('/environment', awsController.addEnvironmentToBucket);

router.post('/service', getAppEnvNames, awsController.addServiceToBucket);

router.get('/services', getAppEnvNames, awsController.services);

router.get('/website', getAppEnvNames, awsController.website);

router.get('/terraform', getAppEnvNames, awsController.terraform);

router.get('/vpc', awsController.vpc);

router.delete('/:name', getAppEnvNames, awsController.removeServiceFromBucket);

module.exports = router;