const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const mongoose = require('mongoose');
const port = 3000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 

app.use(cors());
app.use(cookieParser())

const home = require('./routes/home');
const about = require('./routes/about');
const faq = require('./routes/faq');
const terms = require('./routes/terms');
const auth = require('./routes/auth');
const trade = require('./routes/trade');
const robot = require('./routes/robot');
const account = require('./routes/account');

const langPrefix = require('./middlewares/langPrefix');

app.use(langPrefix);

app.use('/', home);
app.use('/', about);
app.use('/', faq);
app.use('/', terms);
app.use('/', auth);
app.use('/', trade);
app.use('/', robot);
app.use('/', account);

app.use(express.static(path.join(__dirname, 'public')));

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        app.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
        });

        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
};
connectDB();

