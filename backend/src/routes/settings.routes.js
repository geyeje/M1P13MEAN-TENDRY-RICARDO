const express = require('express');
const router = express.Router();
const { getPublicSettings } = require('../controllers/admin.controller');

// GET /api/settings - Public access to site config
router.get('/', getPublicSettings);

module.exports = router;
