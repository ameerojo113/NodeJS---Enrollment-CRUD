const express = require('express');
const router = express.Router();
router.get('/', (req, res) => {
    res.render('index')
});

router.get('/enroll',(req, res) =>{
    res.render('enroll')
});

module.exports = router;