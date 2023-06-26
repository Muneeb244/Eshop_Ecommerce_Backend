const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const Product = require('../models/product');
const mongoose = require('mongoose');
const auth = require('../../middleware/authentication');
const authz = require("../../middleware/authorization");


router.get('/', auth, authz, async (req, res) => {
    const product = await Product.find({}).populate('category');
    if (!product) return res.status(404).send('No product found.');
    res.send(product);
});

router.get('/:id', auth, async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) return res.status(404).send('No product found.');
    res.send(product);
});

router.post('/:id', auth, async (req, res) => {
    console.log(req.params.id);

    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(400).send('Invalid Category');

        const {
            name,
            description,
            richDescription,
            image,
            brand,
            price,
            countInStock,
            rating,
            numReviews,
            isFeatured
        } = req.body;
        const product = new Product({
            name,
            description,
            richDescription,
            image,
            brand,
            price,
            category,
            countInStock,
            rating,
            numReviews,
            isFeatured
        });
        product = await product.save();
        if (!product) return res.status(404).send('Error adding product');
        res.send(product);
    } catch (error) {
        console.log("From category", error);
    }

});

router.put('/:id', auth, async (req, res) => {

    if (mongoose.isValidObjectId(req.params.id)) return res.status(400).send('Invalid Product Id');

    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    const {
        name,
        description,
        richDescription,
        image,
        brand,
        price,
        countInStock,
        rating,
        numReviews,
        isFeatured
    } = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, {
        name,
        description,
        richDescription,
        image,
        brand,
        price,
        countInStock,
        rating,
        numReviews,
        isFeatured
    }, { new: true });

    if (!product) return res.status(404).send('Product cannot be updated .');
    res.send(product);
});


router.delete('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).send('No category found.');
        res.send(product);
    } catch (error) {
        res.status(500).send('Category could not be deleted.');
    }
});

// router.get('/count', async (req, res) => {
//     res.send('Hello');

    // try {
    //     const productCount = await Product.countDocuments((count) => console.log(count));
    //     console.log(productCount);
    //     if (!productCount) return res.status(500).send('No product found.');
    //     res.send(productCount);
    // }
    // catch (error) {
    //     res.status(500).send('Error getting product count.');
    // }
// });



module.exports = router;