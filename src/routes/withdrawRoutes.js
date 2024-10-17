const express = require('express');
const router = express();
const withdrawController = require('../controllers/withdrawController');
const uploadComp = require('../middlewares/addComprov');
const authorize = require('../middlewares/authorize');

router.post('/saques', authorize(4), withdrawController.addWithdraw);
router.get('/saques/:id', authorize(1,2,4), withdrawController.listWithdraws);
router.post(
  '/saques/comprovante/:id',authorize(1),
  uploadComp.single('file'),
  withdrawController.addComprov,
);
router.delete('/saques/comprovante/:id', withdrawController.removeComprov);

module.exports = router;
