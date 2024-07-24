const express = require('express');
const carrosselController = require('../controllers/carrosselController');
const router = express.Router();
const uploadImage = require('../middlewares/addImgCarrossel');

router.get('/carrossel/:id', carrosselController.listCarrossel);
router.post(
  '/carrossel/:id',
  uploadImage.single('file'),
  carrosselController.addImage,
);
router.patch('/carrossel/:id', carrosselController.editCarrossel);
router.delete('/carrossel/:id/:order', carrosselController.removeImage);

module.exports = router;
