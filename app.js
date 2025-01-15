const userRouter = require('./routes/user.routes.js');
const express = require('express'); 
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config();

const connectDB = require('./config/db.js');
connectDB();

const app = express();
const indexRouter = require('./routes/index.routes.js');

app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/user', userRouter);
app.use('/', indexRouter);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});