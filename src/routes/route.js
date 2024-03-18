const express = require('express');
const router = express();
const positionRoutes = require('./positionRoutes');
const userRoutes = require('./userRoutes');
const consultRoutes = require('./consultRoutes');
const requestsRoutes = require('./requestsRoutes');
const withdrawRoutes = require('./withdrawRoutes');
const productsRoutes = require('./productsRoutes');

router.use(positionRoutes);
router.use(userRoutes);
router.use(consultRoutes);
router.use(requestsRoutes);
router.use(productsRoutes);
router.use(withdrawRoutes);

module.exports = router;
