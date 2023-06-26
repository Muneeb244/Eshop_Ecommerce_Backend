const express = require('express');
const router = express.Router();
const { User } = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/authentication');


router.get('/', async (req, res) => {
    const users = await User.find({}).select('-password');
    if (!users) return res.status(400).send('No user found');
    res.send(users);
});

router.get('/:id',auth, async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(400).send('Invalid user id');
    res.send(user);
});

router.post('/login', async (req, res) => {
    const user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).send('Invalid email or password');

    const compare = await bcrypt.compare(req.body.password, user.password);
    if(!compare) return res.status(500).send("Invalid email or password");

    const token = jwt.sign({id: user._id, isAdmin: user.isAdmin}, process.env.secret , {expiresIn: '1d'});
    res.json({user: user.email, token: token});
})

router.post('/', async (req, res) => {

    const {
        name,
        email,
        password,
        phone,
        isAdmin,
        apartment,
        zip,
        city,
        country
    } = req.body;

    let user = new User({
        name,
        email,
        password,
        phone,
        isAdmin,
        apartment,
        zip,
        city,
        country
    });

    user = await user.save();
    if(!user) res.status(500).send("The user cannot be created");
    res.send(user);
});


router.delete('/:id', auth, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).send('No User found.');
        res.send(user);
    } catch (error) {
        res.status(500).send('User could not be deleted.');
    }
});


module.exports = router;