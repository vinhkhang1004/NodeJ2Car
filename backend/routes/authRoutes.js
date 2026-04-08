const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    addAddress,
    deleteAddress,
    setDefaultAddress,
    getUsers,
    deleteUser,
    addToWishlist,
    removeFromWishlist,
    getWishlist,
} = require('../controllers/authController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

// Address routes
router.route('/addresses').post(protect, addAddress);
router.route('/addresses/:addressId').delete(protect, deleteAddress);
router.route('/addresses/:addressId/default').put(protect, setDefaultAddress);

// Wishlist routes
router.route('/wishlist').get(protect, getWishlist);
router.route('/wishlist/:id')
    .post(protect, addToWishlist)
    .delete(protect, removeFromWishlist);

// Admin routes
router.route('/users').get(protect, admin, getUsers);
router.route('/:id').delete(protect, admin, deleteUser);

module.exports = router;
