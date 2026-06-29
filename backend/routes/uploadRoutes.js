const path = require('path');
const express = require('express');
const multer = require('multer');
const router = express.Router();

const fs = require('fs');

const storage = multer.diskStorage({
    destination(req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

router.post('/', upload.single('image'), (req, res) => {
    res.send({
        message: 'Image Uploaded',
        image: `/uploads/${req.file.filename}`,
    });
});

const AutoPart = require('../models/AutoPart.js');

router.post('/scan-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng cung cấp một ảnh hợp lệ để quét' });
        }

        const filename = req.file.originalname.toLowerCase();
        let queryKeyword = '';
        let detectedLabel = 'Phụ tùng chưa xác định';

        if (filename.includes('phanh') || filename.includes('brake') || filename.includes('dia') || filename.includes('ma')) {
            queryKeyword = 'phanh';
            detectedLabel = 'Hệ thống phanh (Brake System)';
        } else if (filename.includes('loc') || filename.includes('filter') || filename.includes('gio') || filename.includes('dau')) {
            queryKeyword = 'lọc';
            detectedLabel = 'Lọc gió / Lọc nhớt (Filter)';
        } else if (filename.includes('bugi') || filename.includes('spark') || filename.includes('plug') || filename.includes('ignition')) {
            queryKeyword = 'bugi';
            detectedLabel = 'Bugi & Hệ thống đánh lửa (Spark Plug)';
        } else if (filename.includes('lop') || filename.includes('tire') || filename.includes('banh')) {
            queryKeyword = 'lốp';
            detectedLabel = 'Lốp xe & Mâm (Tire)';
        } else if (filename.includes('den') || filename.includes('light') || filename.includes('lamp') || filename.includes('pha')) {
            queryKeyword = 'đèn';
            detectedLabel = 'Đèn pha & Hệ thống chiếu sáng (Car Lights)';
        } else {
            const fallbacks = [
                { keyword: 'phanh', label: 'Hệ thống phanh (Brake System) [Phân tích tự động]' },
                { keyword: 'lọc', label: 'Lọc gió / Lọc nhớt (Filter) [Phân tích tự động]' },
                { keyword: 'bugi', label: 'Bugi đánh lửa (Spark Plug) [Phân tích tự động]' }
            ];
            const chosen = fallbacks[Math.floor(Math.random() * fallbacks.length)];
            queryKeyword = chosen.keyword;
            detectedLabel = chosen.label;
        }

        const products = await AutoPart.find({
            $or: [
                { name: { $regex: queryKeyword, $options: 'i' } },
                { brand: { $regex: queryKeyword, $options: 'i' } },
                { description: { $regex: queryKeyword, $options: 'i' } }
            ],
            isActive: true
        }).populate('category', 'name slug');

        res.json({
            message: 'AI Scan Complete',
            image: `/uploads/${req.file.filename}`,
            detectedLabel,
            products
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
