const express = require('express');
const router = express.Router();
const { 
    getParts, 
    getPartById,
    createPart,
    updatePart,
    deletePart,
    getAdminStats
} = require('../controllers/partController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

router.route('/').get(getParts).post(protect, admin, createPart);
router.route('/admin/stats').get(protect, admin, getAdminStats);
router.route('/:id')
    .get(getPartById)
    .put(protect, admin, updatePart)
    .delete(protect, admin, deletePart);

module.exports = router;
