const express = require('express');
const router = express();
const requestsController = require('../controllers/requestsController');
const authorize = require('../middlewares/authorize');

router.post('/pedidos', authorize(4, 5), requestsController.addRequest);
router.get('/pedidos/:id', requestsController.listRequests);
router.patch('/pedidos/:id', requestsController.editRequest);
router.delete('/pedidos/:id', requestsController.removeRequest);

router.post('/saldodisp', requestsController.balanceAvailable);
router.get('/saldodisp', requestsController.getBalance);
router.get(
  '/pedidos/preferences/:preferenceId',
  requestsController.listPreferenceRequest,
);

module.exports = router;
