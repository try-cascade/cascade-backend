const express = require('express');
const router = express.Router();
const terraformController = require('../controllers/terraform.controller')

// Create json terraform document
router.post('/generate', terraformController.create)

// Deploys infrastructure to AWS
router.post('/deploy', terraformController.deploy)

// Destroys infrastructure from AWS
// router.post('/destroy', terraformController.destroy) 
router.get('/destroy', terraformController.destroy) // testing sse with get

// Uploads the TF json files to S3
router.post('/upload', terraformController.upload)

// dummy route for test
router.get('/msg', terraformController.msg)

module.exports = router