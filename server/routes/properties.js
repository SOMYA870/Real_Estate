const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');

router.get('/', propertyController.getAllProperties);
router.get('/:id', propertyController.getPropertyById);
router.post('/', verifyToken, propertyController.createProperty);
router.put('/:id', verifyToken, propertyController.updateProperty);
router.delete('/:id', verifyToken, propertyController.deleteProperty);
router.post('/:id/inquire', verifyToken, requireRole(['client']), propertyController.inquireProperty);
router.delete('/:id/release', verifyToken, requireRole(['client']), propertyController.releasePropertyAsset);

module.exports = router;
