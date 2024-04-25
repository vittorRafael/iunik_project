const express = require('express');
const router = express();
const productsController = require('../controllers/productsController');

router.post('/produtos', productsController.addProduct);
router.get('/produtos/:id', productsController.listProducts);
router.patch('/produtos/:id', productsController.editProduct);
router.delete('/produtos/:id', productsController.removeProduct);
router.get('/produtos', productsController.listProductsConsult);

module.exports = router;
