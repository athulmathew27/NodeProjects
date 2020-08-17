const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { loginSchema }= require('../config/joi_schema');
const db = require('../config/db_conn');

router.get('/',(req,res)=>{
    res.render('login');
})

router.get('/logout',(req,res)=>{
    req.session.destroy();
    res.redirect('/home');
});

router.post('/',(req,res)=>{

    var { loginas,username,password } = req.body;

// Joi validation performing
    const result= loginSchema(req.body);
    if(result.error){
        res.status(400).render('login',{
            status : 'warning' ,
            message : result.error.details[0].message,
            username,password                  
        }); 
        return
    }
//validation successfull => check user exist or not
    if(loginas == "user")
    {
        db.query("select U_ID, U_PASSWORD, U_STATUS from user_tbl where U_EMAIL = ?",[username],(err, result, feilds)=>{

            if(err){
                console.log("Selection failed"+err);
                return
            }
            if(result.length > 0)
            {
            var id = result[0].U_ID;
            var hashpass = result[0].U_PASSWORD;
            var status = result[0].U_STATUS;
            if(status == "Approved")
            {
                //decrypt password here
                bcrypt.compare(password, hashpass, function(err, result) {
                    if(result)
                    {
                        console.log('login sucessfull');
                        const token = jwt.sign({uname : username,uid : id,loginas : loginas},process.env.TOKEN_KEY,{ expiresIn: '1h' });
                        req.session.auth = token;
                        res.redirect('/home'); 
                    }
                    else
                    {
                        console.log('incorrect username or password');
                        res.status(400).render('login',{
                            status : 'danger' ,
                            message : "Incorrect username or password !..",
                            username,password                  
                            }); return
                    }
                });
            }
            else
            {
                res.send('Check your mail id ');
                console.log('incorrect username or password');       
                res.status(400).render('login',{
                status : 'danger' ,
                message : "Check your mail id .",
                username,password                  
                }); return
            }
            
            }
            else
            {       
                console.log('incorrect username or password');       
                res.status(400).render('login',{
                status : 'danger' ,
                message : "Incorrect username or password !..",
                username,password                  
                }); return                    
            }

        });//select closing
    }
    else if(loginas == "shop"){
        db.query("select SH_ID, SH_PASSWORD, SH_STATUS from shop_tbl where SH_EMAIL = ?",[username],(err, result, feilds)=>{

            if(err){
                console.log("Selection failed"+err);
                return
            }
            if(result.length > 0)
            {
            var id = result[0].SH_ID;
            var hashpass = result[0].SH_PASSWORD;
            var status = result[0].SH_STATUS;
            if(status == "Approved")
            {
                //decrypt password here
                bcrypt.compare(password, hashpass, function(err, result) {
                    if(result)
                    {
                        console.log('login sucessfull');
                        res.redirect('/home');
                    }
                    else
                    {
                        console.log('incorrect username or password');
                        res.status(400).render('login',{
                            status : 'danger' ,
                            message : "Incorrect username or password !..",
                            username,password,loginas                  
                            }); return
                    }
                });
            }
            else
            {
                res.send('Check your mail id ');
                console.log('incorrect username or password');       
                res.status(400).render('login',{
                status : 'danger' ,
                message : "Check your mail id .",
                username,password,loginas                  
                }); return
            }
            
            }
            else
            {       
                console.log('incorrect username or password');       
                res.status(400).render('login',{
                status : 'danger' ,
                message : "Incorrect username or password !..",
                username,password,loginas                  
                }); return                    
            }

        });//select closing
    }
    else
    {
        // do admin things here
        res.send("admin ");
    }

});

module.exports = router;