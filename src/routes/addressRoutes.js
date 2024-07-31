const express = require('express');
const addressController = require('../controllers/addressController');
const router = express.Router();

router.post('/endereco', addressController.addAddress);
router.get('/endereco/:id', addressController.listAddress);
router.patch('/endereco/:id', addressController.editAddress);
router.delete('/endereco/:id', addressController.deleteAddress);

module.exports = router;
