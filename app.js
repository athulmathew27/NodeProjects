const express = require('express');
const path = require('path');
const fs = require('fs')
var session = require('express-session')
require('dotenv').config();


//var expressLayoutsEJS = require('express-ejs-layouts');
const home_route = require('./routes/home');
const login_route = require('./routes/login');
const user_route = require('./routes/user');
const shop_route = require('./routes/shop');
const med_route = require('./routes/medicine');

const app=express();

 
//app.use(expressLayoutsEJS);
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended  : false  }));
app.use('/public',express.static(path.join(__dirname,'public')));
app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true
}));

app.use('/home', home_route);
app.use('/login', login_route);
app.use('/user', user_route);
app.use('/shop', shop_route);
app.use('/med', med_route);

app.use('*',(req,res)=>{
    res.send("<h1> E-404: Page Not Found </h1>")
})

app.listen(3000 || process.env.PORT,()=>{console.log("Listening to port 3000")});