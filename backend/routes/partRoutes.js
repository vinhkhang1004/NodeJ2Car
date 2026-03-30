const express = require('express');
const router = express.Router();
const { getParts, getPartById } = require('../controllers/partController.js');

router.route('/').get(getParts);
router.route('/:id').get(getPartById);

module.exports = router;
