const express = require('express');
const router = express();
const withdrawController = require('../controllers/withdrawController');

router.post('/saques', withdrawController.addWithdraw);
router.get('/saques/:id', withdrawController.listWithdraws);
router.delete('/saques/:id', withdrawController.removeWithdraw);

module.exports = router;
