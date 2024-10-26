const express = require('express');
const router = express();
const requestsController = require('../controllers/requestsController');
const authorize = require('../middlewares/authorize');

router.post('/pedidos', requestsController.addRequest);
router.get('/pedidos/:id', requestsController.listRequests);
router.patch('/pedidos/:id', requestsController.editRequest);
router.delete('/pedidos/:id', requestsController.removeRequest);

router.post('/saldodisp', requestsController.balanceAvailable);
router.get('/saldodisp', requestsController.getBalance);
router.get(
  '/pedidos/preferences/:preferenceId',
  requestsController.listPreferenceRequest,
);

router.post('/pedidos/abastecimento', requestsController.addRequestAbast)

module.exports = router;
