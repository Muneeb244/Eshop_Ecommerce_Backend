const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const OrderItem = require('../models/OrderItem');
// const auth = require('../../middleware/authentication');

router.get('/',  async (req, res) => {
    const orders = await Order.find({}).populate('user', 'name email').sort('dateOrdered');
    if (!orders) return res.status(404).send("No order found")

    res.send(orders)
});

router.get('/:id', async (req, res) => {
    const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate({path: 'orderItems', populate: {path: 'product', populate: 'category'}})

    if (!order) return res.status(404).send("No order found")

    res.send(order)
});

router.post('/', async (req, res) => {

    const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product,
        })
        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;
    }));

    const orderItemsIdsResolved = await orderItemsIds
    console.log(orderItemsIdsResolved)

    let totalPrice = await Promise.all(orderItemsIdsResolved.map(async orderItemId => {
        let orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        let price = orderItem.product.price * orderItem.quantity;
        return price
    }))

    totalPrice = totalPrice.reduce((a, b) => a+b);
    console.log(totalPrice)


    const {
        shippingAddress1,
        shippingAddress2,
        city,
        zip,
        country,
        phone,
        status,
        user
    } = req.body;

    let order = new Order({
        "orderItems": orderItemsIdsResolved,
        shippingAddress1,
        shippingAddress2,
        city,
        zip,
        country,
        phone,
        status,
        totalPrice,
        user
    });

    // if(!order) return res.status(500).send('Order could not be created.');
    // res.send(order)
    order.save()
        .then(order => res.send(order))
        .catch(err => res.status(500).send('Category could not be created.'));
});


router.put('/:id', async (req, res) => {
    const order = await Order.findByIdAndUpdate(req.params.id, {
        status: req.body.status
    }, {new: true});

    if(!order) return res.status(404).send('No such order found.');
    res.send(order);
});

router.delete('/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if(!order) return res.status(404).send('No such order found.');

        order.orderItems.map(async orderItem => {
            await OrderItem.findByIdAndDelete(orderItem)
            .catch(err => res.status(500).send('Order item could not be deleted.'));
        })
        res.send(order);
    } catch (error) {
        res.status(500).send('Order could not be deleted.');
    }
});

router.get('/totalSales', async (req, res) => {
    const totalSales = await Order.aggregate([
        {$group: {_id: null, totalSales: {$sum: '$totalPrice'}}}
    ]);
    console.log(totalSales)
    if(!totalSales) return res.status(404).send('Total sales could not be calculated.');
    res.send(totalSales);
});


router.get('/userOrders/:userId', async (req, res) => {
    const userOrderList = await Order.find({user: req.params.userId})
    .populate({path: 'orderItems', populate: {path: 'product', populate: 'category'}})
    .sort({'dateOrdered': -1});

    if(!userOrderList) return res.status(404).send('No orders found.');
    res.send(userOrderList);
});

module.exports = router;