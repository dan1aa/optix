const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    birth: { type: Date, required: true },
    country: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    telegram: { type: String },
    pass: { type: String, required: true },
    timezone: { type: String, required: true },
    gender: { type: String, required: true },
    demoBalance: {type: Number, required: true, default: 1000},
    realBalance: {type: Number, required: true},
    phone: {type: String}
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);