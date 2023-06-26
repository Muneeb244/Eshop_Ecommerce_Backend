const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    street: {
        type: String,
        default: ""
    },
    apartment: {
        type: String,
        default: ""
    },
    zip: {
        type: String,
        default: ""
    },
    city: {
        type: String,
        default: ""
    },
    country: {
        type: String,
        default: ""
    }
});

userSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

userSchema.set("toJSON",{
    virtuals: true,
});

userSchema.pre('save', async function(next){
    console.log(this.password)
    const passwordHash = await bcrypt.hash(this.password, 10)
    this.password = passwordHash;
    next();
})


exports.User = mongoose.model('User', userSchema);
exports.userSchema = userSchema;