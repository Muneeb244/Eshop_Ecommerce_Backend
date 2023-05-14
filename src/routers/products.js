const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
    res.json("products");
});

router.post('/', (req, res) => {

});



module.exports = router;