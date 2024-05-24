const express = require('express');
const movimentController = require('../controllers/movimentController');
const router = express.Router();

router.get('/movimentacoes', movimentController.listMoviments);

module.exports = router;
