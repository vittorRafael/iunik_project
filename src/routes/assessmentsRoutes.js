const express = require('express');
const router = express();
const assessmentsController = require('../controllers/assessmentsController');

router.post('/comentarios/:id', assessmentsController.addAssessments);
router.get('/comentarios/:id', assessmentsController.listAssessments);
router.patch('/comentarios/:id', assessmentsController.updateAssessments);
router.delete('/comentarios/:id', assessmentsController.removeAssessment);

module.exports = router;
