const express = require('express');
const positionControler = require('../controllers/positionControler');
const router = express.Router();

router.get('/cargos', positionControler.listPositions);

module.exports = router;
