const express = require('express');
const router = express();
const withdrawController = require('../controllers/withdrawController');
const uploadComp = require('../middlewares/addComprov');

router.post('/saques', withdrawController.addWithdraw);
router.get('/saques/:id', withdrawController.listWithdraws);
router.post(
  '/saques/comprovante/:id',
  uploadComp.single('file'),
  withdrawController.addComprov,
);
router.delete('/saques/comprovante/:id', withdrawController.removeComprov);

module.exports = router;
