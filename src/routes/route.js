const express = require('express');
const router = express();
const positionRoutes = require('./positionRoutes');
const movimentRoutes = require('./movimentRoutes');
const categoryRoutes = require('./categoryRoutes');
const userRoutes = require('./userRoutes');
const consultRoutes = require('./consultRoutes');
const requestsRoutes = require('./requestsRoutes');
const withdrawRoutes = require('./withdrawRoutes');
const assessmentsRoutes = require('./assessmentsRoutes');
const productsRoutes = require('./productsRoutes');

router.use(positionRoutes);
router.use(userRoutes);
router.use(categoryRoutes);
router.use(consultRoutes);
router.use(requestsRoutes);
router.use(productsRoutes);
router.use(withdrawRoutes);
router.use(assessmentsRoutes);
router.use(movimentRoutes);

module.exports = router;
