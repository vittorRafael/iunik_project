const express = require('express');
const carrosselController = require('../controllers/carrosselController');
const router = express.Router();
const uploadImage = require('../middlewares/addImgCarrossel');
const authorize = require('../middlewares/authorize');

router.post(
  '/carrossel/:id',
  authorize(1),
  uploadImage.single('file'),
  carrosselController.addImage,
);
router.patch(
  '/carrossel/:id',
  authorize(1),
  uploadImage.single('file'),
  carrosselController.editCarrossel,
);
router.delete(
  '/carrossel/:id/:order',
  authorize(1),
  carrosselController.removeImage,
);

module.exports = router;
