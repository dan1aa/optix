const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    birth: { type: Date },
    country: { type: String },
    email: { type: String, required: true, unique: true },
    telegram: { type: String },
    pass: { type: String, required: true },
    timezone: { type: String },
    gender: { type: String },
    demoBalance: {type: Number, required: true, default: 1000},
    realBalance: {type: Number, required: true},
    phone: {type: String},
    isBot: {type: Boolean, default: false},
    ips: { type: Array, default: [] },
    keyDate: { type: Date, default: null },
    isOur: { type: Boolean, default: false } ,
    disabled :{ type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);