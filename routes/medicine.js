const express = require('express')
const router = express.Router();
const formidable = require('formidable')
const path = require('path');
const detect = require('detect-file-type')
const { v4: uuidv4 } = require('uuid');
const fs = require('fs')
var mv = require('mv');
const db = require('../config/db_conn')
const {medSchema} = require('../config/joi_schema')
var id =1




router.get('/',(req,res)=>{
    res.render("medicine")
});

router.post('/', (req, res) => {

// input form data 
    var form = new formidable.IncomingForm(),
    files = [],
    fields = [];
    form.on('field', function(field, value) {
        fields.push([field, value]);
    })
    form.on('file', function(field, file) {
        files.push([field, file]);
    })
    form.on('end', function() {
        console.log('done');
        //console.log(fields[0][1]);  //to print name
        var value = {
             name: fields[0][1] ,
             manfucater : fields[1][1] ,
             category : fields[2][1] ,
             date : fields[3][1] ,
             mrp : fields[4][1] ,
             price : fields[5][1] ,
             stock : fields[6][1] ,
             submit :fields[7][1] 
        };
        const { name,manfucater,category,date,mrp,price,stock } = value;

//checking scheme joi validation
        var joiResult = medSchema(value);
        if(joiResult.error){
            res.status(400).render('medicine',{
                status : 'warning' ,
                message : joiResult.error.details[0].message,
                 name,manfucater,category,date,mrp,price,stock            
            }); 
            return
        }
// validation completedd => check if med exist
        db.query("select count(*) as counter from med_tbl where SH_ID = ? and MD_NAME = ?",[1,name],(err,result,feilds)=>{
        if(err){
            console.log("select query error");
            return res.send("server is under maintance");            
        }
        if(result[0].counter > 0)
        {
            return res.send("You already add this medicine, please update the list")              
        }
        else
        {
            db.beginTransaction(function(err) {
            if (err) { throw err; }
// No med => insert data
            db.query("insert into med_tbl (SH_ID, MD_NAME, MD_MANF, MD_CATEGORY, MD_EXP, MD_MRP, MD_PRICE, MD_STOCK) values (?,?,?,?,?,?,?,?)",[1,name,manfucater,category,date,mrp,price,stock],(err,result)=>{
            if(err)
            {   
                db.rollback(function() {
                throw err;
                });
                console.log("insert query error"+err);
                res.send("server is under maintance");
                return
                }

                var medid = result.insertId;
// data inserted => make directory for images 
                fs.mkdir("./public/uploads/"+medid, {recursive: true} , function(err) {
                if (err) 
                {
                    console.log("cannot create new dir "+err)
                } 
                else
                {                    
// Directory created succesfully  => insert image to directory
                    console.log("New directory successfully created." + medid)
                    var length = files.length;
                    for(let i = 0; i < length ; i++ )
                    {
                        console.log(files[i][1].name);
                        detect.fromFile(files[i][1].path,(err,result)=>{
                            const picName = uuidv4()+"."+result.ext;                      
                            const imgType = ["jpg","jpeg","png","gif"];
                                if(!imgType.includes(result.ext))
                                {
                                    console.log("inavild type")
                                    return res.end("choose another type")
                                }
                                const oldPath = files[i][1].path;
                                const newPath = path.join(__dirname,'..',"public/uploads/"+medid,picName);
                                mv(oldPath,newPath,err=>{
                                if(err){
                                return res.send("unable to move"+err);
                                }
                                console.log("image inserted");
                                })
                        })

                    }//for loop
                }
                })//mkdir
//image inserted successfully => send response               
                db.commit(function(err) {
                    if (err) { 
                      db.rollback(function() {
                        throw err;
                      });
                    }
                    console.log('Transaction Completed Successfully.' + medid );
                    return res.send("Data added successfully")
                    db.end();
                });

            });//insert closing
            }); //transaction mysql
            }
        });//select closing         
    });//form
    form.parse(req);

});
module.exports = router;