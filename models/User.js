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
    gender: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);