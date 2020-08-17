const express = require('express');
const router = express.Router();

const verify = require('../config/verifyToken');

router.get('/',verify,(req,res)=>{
    console.log(req.user_data);
    res.render('home');
});

module.exports=router;
