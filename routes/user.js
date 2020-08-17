const express = require('express');
const router = express.Router();
var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

var db=require('../config/db_conn');
const { userSchema }=require('../config/joi_schema');


router.get('/',(req,res)=>{
    res.render('user');
});
//-----------------------------------------------------------------------------------------------------------------------
router.post('/add',(req,res)=>{
    var { name,phno,email,address,pincode,postoffice,district,state,country,password1 } = req.body;
    
    //joi validation 
    const result= userSchema(req.body);
    if(result.error){
        res.status(400).render('user',{
            status : 'warning' ,
            message : result.error.details[0].message,
            name,phno,email,address,pincode,postoffice,district,state,country            
        }); 
        return
    }
    // joi validatation success => checking DB for user EXIST 
       
    db.query("select count(*) as counter from user_tbl where U_EMAIL = ?",[email],(err, result, feilds)=>{
        if(err){
            console.log('unable to check for user existance'+err+query);
            res.status(400).render('user',{
                status : 'warning' ,
                message : "Something went wrong !",
                name,phno,email,address,pincode,postoffice,district,state,country            
            }); return
        }
        if(result[0].counter==0){ //check for user existance

            //send in mail starts here
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: process.env.EMAIL_ID_SENDER,
                  pass: process.env.EMAIL_PASSWORD_SENDER
                }
              });

            //creating confirmation link using jwt token
            const token = jwt.sign({email,password1 }, process.env.JWT_ACC_TOKEN_KEY, {expiresIn: '20m'} )
      
            var mailOptions = {
            from: 'MedShop  <athulmathew27@gmail.com>',
            to: email,
            subject: 'Activation Link',
            html: `<h2> Please use this link to activate your account. <h2>
                    <l>http://localhost:3000/user/authentication/${token} </l>`
            };

            transporter.sendMail(mailOptions, function(error, info){
            if (error) {
            console.log("Email error"+error);
            res.status(400).render('user',{
                status : 'warning' ,
                message : "Unable to send Email Currently. Please Check your internet connection.",
                name,phno,email,address,pincode,postoffice,district,state,country            
            }); 
            return
            } else {
            console.log('Email sent: ' + info.response);
            // mail send => now insert user data in table

            //hash password before entry

            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(password1, salt, function(err, hash) {
                    if(err){
                        console.log("password encrypt error"+err);
                        return
                    } 
            //hashing done  =>  inserting data
           
            db.beginTransaction(function(err) {
                if (err) { throw err; }
            db.query("insert into user_tbl  (U_NAME,U_PHNO,U_EMAIL,U_PASSWORD,U_STATUS) values (?,?,?,?,?)", [name,phno,email,hash,"pending"], (err,result,feilds)=>{
            
                if(err){
                db.rollback(function() {
                    throw err;
                  });
                console.log('unable to insert data'+err);
                res.status(400).render('user',{
                    status : 'warning' ,
                    message : "Something went wrong!",
                    name,phno,email,address,pincode,postoffice,district,state,country            
                }); 
            }
            const log = result.insertId;
            
            db.query('insert into user_address_tbl (U_ID,U_ADDRESS,U_POSTOFFICE,U_DISTRICT,U_STATE,U_COUNTRY) values(?,?,?,?,?,?)',[log,address,postoffice,district,state,country], function(err, result) {
                if (err) {  
                  db.rollback(function() {
                    throw err;
                    res.status(400).render('user',{
                        status : 'warning' ,
                        message : "Something went wrong!",
                        name,phno,email,address,pincode,postoffice,district,state,country            
                    }); 
                  });
                }    
                db.commit(function(err) {
                    if (err) { 
                      db.rollback(function() {
                        throw err;
                        res.status(400).render('user',{
                            status : 'warning' ,
                            message : "Something went wrong!",
                            name,phno,email,address,pincode,postoffice,district,state,country            
                        }); 
                      });
                    }
                    console.log('Transaction Completed Successfully.');
                    res.send("An Email has been sent to your mail id please confirm your account.");
                    db.end(); 
                });
            });
        });
    });         

            });//hash closing
            });//hash closing
            }
            });
            // Mail send => Check Activation link in mail => move to user/authentication/
            
        }else{
            res.status(400).render('user',{
                status : 'warning' ,
                message : "You are already a user.",
                name,phno,email,address,pincode,postoffice,district,state,country            
            }); 
            return
        }

    }); //select query closing 

});
//-------------------------------------------------------------------------------------------------------------------------    
    
router.get('/authentication/:token1', (req,res)=>{
    var token_rec = req.params.token1;
    if(!token_rec){
        res.send("something went wrong")
    }else{
        jwt.verify(token_rec, process.env.JWT_ACC_TOKEN_KEY, (err, decodedtoken)=>{
            if(err){
               return res.send("invalid token! Please register again")
            }
            const { email,password1} = decodedtoken;
            console.log("Token decoded"+email);
            //Token decoded => checking for user existance
            db.query('select count(*) as counter from user_tbl where U_EMAIL = ?', [email], (err,result,feilds)=>{
                if(err){
                    console.log("unable to check user existance");
                    return 
                }
                if(result[0].counter == 1){
                    db.query("update user_tbl set U_STATUS = 'Approved' WHERE U_EMAIL = ?", [email], (err,result)=>{
                        if(err){
                            console.log("unable to update table");
                            return
                        }
                        res.status(200).render("login");
                    });//update closing
                }else{
                    res.status(200).render("login");
                }
            });//select closing
            
        });//jwt closing
    }
});

module.exports = router;