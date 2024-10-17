const express = require('express');
const router = express();
const consultController = require('../controllers/consultController');
const authorize = require('../middlewares/authorize');

router.get('/consultores/:id', authorize(4), consultController.listConsults);
router.patch('/consultores/:id', authorize(1, 2), consultController.bloqConsult);

//tabela consultor_produtos
router.get('/consultor/produtos', authorize(4), consultController.listMyProducts);
router.post('/consultor/produtos/:id', authorize(4), consultController.addProductConsult);
router.patch('/consultor/produtos/:id', authorize(4), consultController.editProductConsult);
router.delete(
  '/consultor/produtos/:id', authorize(4),
  consultController.deleteProductConsult,
);

module.exports = router;
