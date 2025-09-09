const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

router.get('/', propertyController.getProperties);
router.get('/:id', propertyController.getPropertyDetail);

module.exports = router;
