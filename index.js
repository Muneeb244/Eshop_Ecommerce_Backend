require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const app = express();

//Routers
const user = require('./src/routers/users');
const category = require('./src/routers/categories');
const product = require('./src/routers/products');
const order = require('./src/routers/orders');


//Middleware
app.use(morgan('tiny'));
app.use(express.json());

//Routes
app.use('/api/users', user); // its remaining
app.use('/api/categories', category);
app.use('/api/products', product);
app.use('/api/orders', order);



//Connect to DB
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true, dbName: "Eshop" })
.then(() => console.log('Connected to Mongodb...'))
.catch(err => console.log(err));

app.get('/', (req, res) => {
    res.json("Its working");
})



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));