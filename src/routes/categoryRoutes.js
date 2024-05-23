const express = require('express');
const categoryController = require('../controllers/categoryController');
const router = express.Router();

router.get('/categorias', categoryController.listCategorys);
router.post('/categorias', categoryController.addCategory);
router.delete('/categorias/:id', categoryController.removeCategory);

module.exports = router;
