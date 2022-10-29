const express = require('express');
const router = express.Router();
const terraformController = require('../controllers/terraform.controller')

// Create json terraform document
router.post('/generate', terraformController.create)

// Deploys infrastructure to AWS
router.post('/deploy', terraformController.deploy)

// Destroys infrastructure from AWS
router.post('/destroy', terraformController.destroy)

router.post('/uploadEnvironment', terraformController.uploadS3EnvironmentObject)

module.exports = router