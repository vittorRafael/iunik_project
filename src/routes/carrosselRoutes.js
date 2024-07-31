const express = require('express');
const carrosselController = require('../controllers/carrosselController');
const router = express.Router();
const uploadImage = require('../middlewares/addImgCarrossel');
const authorize = require('../middlewares/authorize');

router.post(
  '/carrossel/:id',
  uploadImage.single('file'),
  carrosselController.addImage,
);
router.patch(
  '/carrossel/:id',
  uploadImage.single('file'),
  carrosselController.editCarrossel,
);
router.delete('/carrossel/:id/:order', carrosselController.removeImage);

module.exports = router;
