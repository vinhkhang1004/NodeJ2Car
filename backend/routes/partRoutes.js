const express = require('express');
const router = express.Router();
const { 
    getParts, 
    getPartById,
    createPart,
    updatePart,
    deletePart,
    getAdminStats,
    createPartReview,
    getAdminReviews,
    updateReviewReply,
    deleteReview,
    getBrands,
} = require('../controllers/partController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

router.route('/').get(getParts).post(protect, admin, createPart);
router.route('/brands').get(getBrands);
router.route('/admin/stats').get(protect, admin, getAdminStats);

router.route('/admin/reviews').get(protect, admin, getAdminReviews);
router.route('/:id/reviews').post(protect, createPartReview);
router.route('/:partId/reviews/:reviewId/reply').post(protect, admin, updateReviewReply);
router.route('/:partId/reviews/:reviewId').delete(protect, admin, deleteReview);


router.route('/:id')
    .get(getPartById)
    .put(protect, admin, updatePart)
    .delete(protect, admin, deletePart);

module.exports = router;
