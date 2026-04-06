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

// Admin routes
router.route('/users').get(protect, admin, getUsers);
router.route('/:id').delete(protect, admin, deleteUser);

module.exports = router;
