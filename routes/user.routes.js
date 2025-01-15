const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// register routes
router.get('/register', (req, res) => {
    res.render('register');
});
router.post('/register',
    body('email').trim().isEmail().isLength({ min: 13 }),
    body('password').isLength({ min: 5 }),
    body('password').isLength({ max: 10 }),
    body('username').isLength({ min: 3 }),

    async (req, res) => {
    
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
        errors: errors.array(),
        message: 'Invalid data'});
    }
    
    const {email, password, username} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
        email,
        password : hashedPassword,
        username
    });

    res.json(newUser);
});

// login routes
router.get('/login', (req, res) => {
    res.render('login');
});
router.post('/login',
    body('username').trim().isLength({ min: 3 }),
    body('password').isLength({ min: 5 }),
    async (req, res) => {
        // check for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: 'Invalid data'
            });
            
        }
        // check if user exists
        const {username, password} = req.body;
        const user = await userModel.findOne({
            username:username
        });
        if (!user) {
            return res.status(400).json({
                message: 'User or password is incorrect'
            });
        }
        // check if password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: 'User or password is incorrect'
            });
        }
        // create token
        const token = jwt.sign({
            userId : user._id,
            email: user.email,
            username: user.username
        }, 
        process.env.JWT_SECRET)
        res.cookie('token',token);
        res.send('Logged in'); 

    });
module.exports = router;
