const express = require('express');
const router = express();
const requestsController = require('../controllers/requestsController');

router.post('/pedidos', requestsController.addRequest);
router.get('/pedidos/:id', requestsController.listRequests);
router.patch('/pedidos/:id', requestsController.editRequest);
router.delete('/pedidos/:id', requestsController.removeRequest);

router.post('/saldodisp', requestsController.balanceAvailable);
router.get('/saldodisp', requestsController.getBalance);

module.exports = router;
