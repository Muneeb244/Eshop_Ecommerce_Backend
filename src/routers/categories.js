const express = require('express');
const router = express.Router();
const Category = require('../models/Category');


router.get('/', async (req, res) => {
    const categories = await Category.find({});
    if(!categories) return res.status(404).send('No categories found.');
    res.send(categories);
});

router.post('/', (req, res) => {

});



module.exports = router;