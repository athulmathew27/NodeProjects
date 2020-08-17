var mysql=require("mysql");
//require('dotenv').config();

var mysqlconn= mysql.createConnection(
    {
        host : "localhost",
        user : "root",
        password : process.env.DB_KEY,
        database : "med_shop_db",
        multipleStatements : true
    });
    mysqlconn.connect((err)=>{
        if(!err)
            console.log("Database connected");
        else
            console.log("connection failed"+err);        
    });

    module.exports = mysqlconn;