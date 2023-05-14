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

//Routes
app.use('/api/users', user);
app.use('/api/categories', category);
app.use('/api/products', product);
app.use('/api/orders', order);



//Connect to DB
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Connected to Mongodb...'))
.catch(err => console.log(err));


//Middleware
app.use(morgan('tiny'));
app.use(express.json());


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));