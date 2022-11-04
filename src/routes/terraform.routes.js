const express = require('express');
const router = express.Router();
const terraformController = require('../controllers/terraform.controller')

// Create json terraform document
router.post('/generate', terraformController.create)

// Deploys infrastructure to AWS
router.post('/deploy', terraformController.deploy)

// Destroys infrastructure from AWS
router.post('/destroy', terraformController.destroy)

// Uploads the TF json files to S3
router.post('/upload', terraformController.upload)

module.exports = router