const express = require('express');
const movimentController = require('../controllers/movimentController');
const router = express.Router();
const authorize = require('../middlewares/authorize');

router.get('/movimentacoes', authorize(1),  movimentController.listMoviments);

module.exports = router;
