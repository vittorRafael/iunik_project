const express = require('express');
const router = express();
const consultController = require('../controllers/consultController');

router.get('/consultores/:id', consultController.listConsults);
router.patch('/consultores/:id', consultController.bloqConsult);

//tabela consultor_produtos
router.get('/consultor/produtos', consultController.listMyProducts);
router.post('/consultor/produtos/:id', consultController.addProductConsult);
router.patch('/consultor/produtos/:id', consultController.editProductConsult);
router.delete(
  '/consultor/produtos/:id',
  consultController.deleteProductConsult,
);

module.exports = router;
