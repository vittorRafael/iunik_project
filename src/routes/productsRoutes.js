const express = require('express');
const router = express();
const productsController = require('../controllers/productsController');
const uploadImages = require('../middlewares/addImgProd');

router.post('/produtos', productsController.addProduct);
router.patch('/produtos/:id', productsController.editProduct);
router.delete('/produtos/:id', productsController.removeProduct);
router.get('/produtos', productsController.listProductsConsult);
router.post(
  '/produtos/fotos/:id',
  uploadImages.array('files'),
  productsController.addImgProd,
);

router.delete('/produtos/fotos/:id', productsController.removeImgProd);

module.exports = router;
