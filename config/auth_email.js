var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');

  
var authMail =   (email,password,usertype)=>{
var transporter =  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_ID_SENDER,
      pass: process.env.EMAIL_PASSWORD_SENDER
    }
  });

//creating confirmation link using jwt token
const token = jwt.sign({email,password }, process.env.JWT_ACC_TOKEN_KEY, {expiresIn: '20m'} )

var mailOptions = {
from: 'MedShop  <athulmathew27@gmail.com>',
to: email,
subject: 'Activation Link',
html: `<h2> Please use this link to activate your account. <h2>
        <l>${process.env.DOMAIN}/${usertype}/authentication/${token} </l>`
};

return {mailOptions,transporter};
}
module.exports.authMail = authMail;