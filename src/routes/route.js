const express = require('express');
const router = express();
const positionRoutes = require('./positionRoutes');
const userRoutes = require('./userRoutes');

router.use(positionRoutes);
router.use(userRoutes);
module.exports = router;
