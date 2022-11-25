const express = require('express');
const router = express.Router();
const terraformController = require('../controllers/terraform.controller')
const { getAppEnvNames } = require('../utils/middleware')

// Create json terraform document
router.post('/generate', terraformController.create)

// Deploys infrastructure to AWS
router.post('/deploy', terraformController.deploy)

// Destroys infrastructure from AWS
// router.post('/destroy', terraformController.destroy) 
router.get('/destroy', terraformController.destroy) // testing sse with get

// Uploads the TF json files to S3
router.post('/upload', getAppEnvNames, terraformController.upload)

// dummy route for test
router.get('/msg', terraformController.msg)

// created for debugging
router.get('/deployNoStream', terraformController.deployNoStream)
router.get('/destroyNoStream', terraformController.destroyNoStream)

module.exports = router