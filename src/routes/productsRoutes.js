const express = require('express');
const router = express();
const productsController = require('../controllers/productsController');
const uploadImages = require('../middlewares/addImgProd');
const authorize = require('../middlewares/authorize');

router.post('/produtos', authorize(1,2,4), productsController.addProduct);
router.patch('/produtos/:id',authorize(1,2,4), productsController.editProduct);
router.delete('/produtos/:id',authorize(1,2,4), productsController.removeProduct);
router.get('/produtos',authorize(1,2,4), productsController.listProductsConsult);
router.post(
  '/produtos/fotos/:id',
  uploadImages.array('files'),authorize(1,2,4),
  productsController.addImgProd,
);

router.delete('/produtos/fotos/:id',authorize(1,2,4), productsController.removeImgProd);


module.exports = router;
