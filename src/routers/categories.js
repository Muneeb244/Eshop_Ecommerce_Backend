const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const auth = require('../../middleware/authentication');


router.get('/', auth, async (req, res) => {
    const categories = await Category.find({});
    if(!categories) return res.status(404).send('No categories found.');
    res.send(categories);
});

router.post('/', auth, (req, res) => {
    const {name, icon, color} = req.body;
    let category = new Category({
        name, icon, color
    });
    category.save()
    .then(category => res.send(category))
    .catch(err => res.status(500).send('Category could not be created.'));
});

router.put('/:id', auth, async (req, res) => {
    const {name, icon, color} = req.body;
    const category = await Category.findByIdAndUpdate(req.params.id, {
        name, icon, color
    }, {new: true});

    if(!category) return res.status(404).send('No category found.');
    res.send(category);
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if(!category) return res.status(404).send('No category found.');
        res.send(category);
    } catch (error) {
        res.status(500).send('Category could not be deleted.');
    }
});

module.exports = router;