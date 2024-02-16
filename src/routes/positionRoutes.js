const express = require('express');
const positionControler = require('../controllers/positionControler');
const router = express.Router();

router.get('/cargos', positionControler.listPositions);
router.post('/cargos', positionControler.addPosition);
router.delete('/cargos/:id', positionControler.removePosition);

module.exports = router;
