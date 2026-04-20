const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');

// We will skip auth middleware for deep prototyping if it causes issues, but for now we try
router.get('/admin', verifyToken, requireRole(['admin']), dashboardController.getAdminDashboard);
router.delete('/admin/users/:type/:id', verifyToken, requireRole(['admin']), dashboardController.deleteUserAccount);
router.post('/admin/query', verifyToken, requireRole(['admin']), dashboardController.executeCustomQuery);
router.get('/agent', verifyToken, requireRole(['agent']), dashboardController.getAgentDashboard);
router.put('/agent/inquiries/:inquiry_id', verifyToken, requireRole(['agent']), dashboardController.resolveInquiry);
router.get('/client', verifyToken, requireRole(['client']), dashboardController.getClientDashboard);
router.get('/owner', verifyToken, requireRole(['owner']), dashboardController.getOwnerDashboard);

module.exports = router;
