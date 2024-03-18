const express = require('express');
const router = express();
const consultController = require('../controllers/consultController');

router.get('/consultores/:id', consultController.listConsults);
router.patch('/consultores/:id', consultController.bloqConsult);

module.exports = router;
