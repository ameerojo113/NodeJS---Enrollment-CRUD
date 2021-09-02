const express = require('express');
const router = express.Router();
const enrollcontroller = require('../controllers/auth');

router.post('/enroll', enrollcontroller.enroll);
router.post('/login', enrollcontroller.login);
router.get('/updateform/:StudentID', enrollcontroller.updateform);
router.post('/updatestudent', enrollcontroller.updatestudent);
router.get('/deletestudent/:StudentID', enrollcontroller.deletestudent);

module.exports = router;