const jwt = require('jsonwebtoken');

module.exports=function(req,res,next){
    //var token = req.cookies.auth;
    var token = req.session.auth;
    // decode token
    if (token) {
  
      jwt.verify(token, process.env.TOKEN_KEY, function(err, token_data) {
        if (err) {
           return res.status(403).send('Error + Token expire please login again');
        } else {
          req.user_data = token_data;
         // console.log(req.user_data.uname);
          next();
        }
      });
  
    } else {
      return res.status(403).send('No token available');
    }
}


// module.exports=function(req,res,next){
//     const token = req.header('auth-token');
//     console.log("mytoken========"+req.uname);
//     if(!token) return res.status(401).send("Access Denied");
//     try{
//         const verified = jwt.verify(token,process.env.TOKEN_KEY);
//         req.uname = verified;
//         next();
//     }
//     catch(err){
//         res.status(400).send("Invalid Token");
//     }
// };






// const jwt = require('jsonwebtoken');
// const appsettings = require('../appsettings');
// const commonResponse = require('../models/commonresponse.model');

// function verifyToken(req, res, next) {
//     var token = req.headers['x-access-token'];
//     if (!token) {
//         res.status(403);
//         var response = new commonResponse();
//         response.message = 'No token provided.';
//         response.data.push({ auth: false, message: 'No token provided.' });
//         res.send(response);
//     }
//     //return res.status(403).send({ auth: false, message: 'No token provided.' });

//     jwt.verify(token, appsettings.secret, function (err, decoded) {
//         if (err) {
//             res.status(500);
//             var response = new commonResponse();
//             response.message = 'Failed to authenticate token';
//             response.data.push({ auth: false, message: 'Failed to authenticate token.' });
//             res.send(response);
//         }
//         //return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

//         // if everything good, save to request for use in other routes
//         req.userId = decoded.id;
//         next();
//     });
// }

// module.exports = verifyToken;