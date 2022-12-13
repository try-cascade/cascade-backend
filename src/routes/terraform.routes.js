const express = require('express');
const router = express.Router();
const terraformController = require('../controllers/terraform.controller');
const { getAppEnvNames } = require('../utils/middleware');

// Generate json terraform document
router.post('/generate', terraformController.generate);

// Deploy infrastructure to AWS
router.get('/deploy', terraformController.deploy);

// Destroy infrastructure from AWS
router.get('/destroy', terraformController.destroy);

// Upload the TF json files to S3
router.post('/upload', getAppEnvNames, terraformController.upload);

module.exports = router;