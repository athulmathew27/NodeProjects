const express = require('express');
const router = express.Router();
var nodemailer = require('nodemailer');
const bcrypt =  require('bcrypt')
const jwt = require('jsonwebtoken')

const db = require('../config/db_conn');
const { shopSchema }=require('../config/joi_schema');
const { authMail } = require('../config/auth_email');

router.get('/', (req,res)=>{
    res.render("shop");
});

router.post('/', (req,res)=>{
    
    var { name,phno,email,building,licence,registeration,pincode,postoffice,district,state,country,password1 } = req.body;
    var address = building+","+postoffice+","+district+","+state+","+country+","+pincode;
    
    //joi validatation
    const result= shopSchema(req.body);
    if(result.error){
        res.status(400).render('shop',{
            status : 'warning' ,
            message : result.error.details[0].message,
            name,phno,email,building,licence,registeration,pincode,postoffice,district,state,country            
        }); 
        return
    }
//joi validation successfull => check for user existance
    db.query("select count(*) as counter, SH_STATUS,SH_PASSWORD from shop_tbl where SH_EMAIL = ?",[email],  (err,result,feild)=>{
        if(err)
        {console.log("DB error "+err);return}
        if(result[0].counter == 0)
        {

//user not exist => send mail
        var  values =  authMail(email,password1,"shop");
        values.transporter.sendMail(values.mailOptions,  function(error, info){
            if (error) {
            console.log("Email error : "+error);
            return 
            } else 
            {    
                console.log('Email sent: ' + info.response);
// mail send => now insert user data in table
                bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(password1, salt, function(err, hash) {
                if(err){
                    console.log("password encrypt error"+err);
                    return
                } 
                let time = new Date();
                db.query("insert into shop_tbl  (SH_NAME,SH_PHNO,SH_EMAIL,SH_LIC,SH_REG,SH_ADDRESS,SH_PASSWORD,SH_STATUS,SH_TIME) values (?,?,?,?,?,?,?,?,?)", [name,phno,email,licence,registeration,address,hash,"pending",time], (err,result,feilds)=>{
                    if(err){
                        console.log('insert error'+err);
                        return
                    }
//data inserted succesfully=>
                    res.send('An invitation link has benn sent to your mail id. Please confirm your account')
                });
                });
                });
            }            
            });
        }
        else
        { 
            if(result[0].SH_STATUS == "pending")//if already inserted Resend token again
            {   
                var  values =  authMail(email,password1,"shop");
                values.transporter.sendMail(values.mailOptions,  function(error, info){
                if (error) {
                    console.log("Email error : "+error);
                    return 
                }
                else{
//update time in table and send response
                    console.log("email send");
                    let time = new Date();
                    bcrypt.genSalt(10, function(err, salt) {
                        bcrypt.hash(password1, salt, function(err, hash) {
                        if(err){
                            console.log("password encrypt error"+err);
                            return
                        } 
                    db.query("update shop_tbl set SH_NAME = ?, SH_PHNO = ?, SH_LIC = ?, SH_REG = ?, SH_ADDRESS = ?, SH_PASSWORD = ?, SH_TIME = ? where SH_EMAIL = ? ",[name,phno,licence,registeration,address,hash,time,email],(err,result)=>{
                        if(err){
                            console.log("insert error"+err);
                            return
                        }
                        res.send("check you mail for confirmation mail")
                    });  
                    });
                    });
                }
                });
            }
            else
            {
//Approved shop redirect to login
                console.log("already registered");
                res.redirect('/login');
                return
            }
        }
    });//select closing   
});


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
            db.query('select count(*) as counter from shop_tbl where SH_EMAIL = ?', [email], (err,result,feilds)=>{
                if(err){
                    console.log("unable to check user existance");
                    return 
                }
                if(result[0].counter == 1){
                    db.query("update shop_tbl set SH_STATUS = 'Approved' WHERE SH_EMAIL = ?", [email], (err,result)=>{
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