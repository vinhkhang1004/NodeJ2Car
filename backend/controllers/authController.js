const User = require('../models/User.js');
const generateToken = require('../utils/generateToken.js');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                wishlist: user.wishlist || [],
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                wishlist: user.wishlist || [],
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Logout user / clear token
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
    // In a stateless JWT approach, logout is typically handled on the client side
    // by removing the token. We can also add it to a blacklist if needed,
    // but returning a success message is standard for a simple setup.
    res.json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                phone: user.phone,
                address: user.address,
                city: user.city,
                country: user.country,
                postalCode: user.postalCode,
                addresses: user.addresses || [],
                wishlist: user.wishlist || [],
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            user.address = req.body.address || user.address;
            user.city = req.body.city || user.city;
            user.country = req.body.country || user.country;
            user.postalCode = req.body.postalCode || user.postalCode;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
                phone: updatedUser.phone,
                address: updatedUser.address,
                city: updatedUser.city,
                country: updatedUser.country,
                postalCode: updatedUser.postalCode,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a new address to user profile
// @route   POST /api/auth/addresses
// @access  Private
const addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const newAddress = {
            label: req.body.label || '',
            name: req.body.name,
            phone: req.body.phone,
            address: req.body.address,
            city: req.body.city,
            country: req.body.country || 'Việt Nam',
            postalCode: req.body.postalCode || '',
            lat: req.body.lat,
            lng: req.body.lng,
            isDefault: user.addresses.length === 0, // First address is default
        };

        user.addresses.push(newAddress);
        await user.save();

        res.status(201).json({ addresses: user.addresses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an address from user profile
// @route   DELETE /api/auth/addresses/:addressId
// @access  Private
const deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.addresses = user.addresses.filter(
            (addr) => addr._id.toString() !== req.params.addressId
        );
        await user.save();

        res.json({ addresses: user.addresses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Set default address
// @route   PUT /api/auth/addresses/:addressId/default
// @access  Private
const setDefaultAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.addresses = user.addresses.map((addr) => ({
            ...addr.toObject(),
            isDefault: addr._id.toString() === req.params.addressId,
        }));
        await user.save();

        res.json({ addresses: user.addresses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/auth/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await User.deleteOne({ _id: user._id });
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add product to wishlist
// @route   POST /api/auth/wishlist/:id
// @access  Private
const addToWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const productId = req.params.id;
        
        // Prevent duplicate IDs using robust comparison
        const isAlreadyAdded = user.wishlist.some(
            (id) => id.toString() === productId
        );

        if (isAlreadyAdded) {
            return res.status(400).json({ message: 'Product already in wishlist' });
        }

        user.wishlist.push(productId);
        await user.save();

        res.json({ wishlist: user.wishlist, message: 'Added to wishlist' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/auth/wishlist/:id
// @access  Private
const removeFromWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.wishlist = user.wishlist.filter(
            (id) => id.toString() !== req.params.id
        );
        await user.save();

        res.json({ wishlist: user.wishlist, message: 'Removed from wishlist' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user wishlist
// @route   GET /api/auth/wishlist
// @access  Private
const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'wishlist',
            select: 'name price imageUrl brand category stock rating numReviews description'
        });
        
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user.wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//..
module.exports = {
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
};
