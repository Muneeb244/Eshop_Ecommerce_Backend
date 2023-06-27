const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const Product = require('../models/product');
const mongoose = require('mongoose');
const auth = require('../../middleware/authentication');
const multer = require('multer');

const FILE_TYPE = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isValid = FILE_TYPE[file.mimetype];
        let extensionError = new Error("Invalid image type");

        if (isValid) extensionError = null;
        cb(extensionError, 'public/uploads/')
    },
    filename: (req, file, cb) => {
        const extension = FILE_TYPE[file.mimetype]
        const fileName = file.originalname.replace(' ', '-').replace(`.${extension}`, "");
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
});

const upload = multer({ storage });


router.get('/', auth, async (req, res) => {
    const product = await Product.find({}).populate('category');
    if (!product) return res.status(404).send('No product found.');
    res.send(product);
});

router.get('/:id', auth, async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) return res.status(404).send('No product found.');
    res.send(product);
});

router.post('/:id', auth, upload.single('image'), async (req, res) => {

    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(400).send('Invalid Category');

        const image = req.file?.filename;
        if (!image) return res.status(400).send('No image in the request');
        const imagePath = `${req.protocol}://${req.get('host')}/public/uploads/${image}`;

        const {
            name,
            description,
            richDescription,
            brand,
            price,
            countInStock,
            rating,
            numReviews,
            isFeatured
        } = req.body;
        let product = new Product({
            name,
            description,
            richDescription,
            image: imagePath,
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

router.put('/:id', auth, upload.single('image'), async (req, res) => {

    if (mongoose.isValidObjectId(req.params.id)) return res.status(400).send('Invalid Product Id');

    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    const oldProduct = await Product.findById(req.params.id);
    if (!oldProduct) return res.status(400).send('Invalid Product');


    let imagePath;
    if (req.file) {
        const image = req.file?.filename;
        imagePath = `${req.protocol}://${req.get('host')}/public/uploads/${image}`;
    }
    else imagePath = oldProduct.image;

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
        image: imagePath,
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


router.put('/gallery-images/:id', auth, upload.array('images', 10), async (req, res) => {
    // if (mongoose.isValidObjectId(req.params.id)) return res.status(400).send('Invalid Product Id');

    if(!req.files) return res.status(400).send('No images in the request');

    const product = await Product.findByIdAndUpdate(req.params.id, {
        images: req.files.map(file => `${req.protocol}://${req.get('host')}/public/uploads/${file.filename}`)
    }, { new: true });

    if (!product) return res.status(404).send('Product cannot be updated .');
    res.send(product);

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