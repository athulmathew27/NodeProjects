const Joi = require('joi');

const userSchema = (data)=>{
    const schema = Joi.object().keys({
        name: Joi.string().alphanum().min(3).max(30).required(),
        phno: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
        email: Joi.string().email({ tlds: { allow: false } }),
        address: Joi.string().required(),
        pincode: Joi.number().integer().required(),
        postoffice: Joi.string().required(),
        district: Joi.string().required(),
        state: Joi.string().required(),
        country: Joi.string().required(),
        password1: Joi.string().alphanum().min(3).max(30).required(),
        password2: Joi.ref('password1'),
        submit: Joi.required()
        });
        return schema.validate(data)
};


const loginSchema = (data)=>{
    const loginSchema = Joi.object().keys({
        loginas : Joi.string().required(),
        username : Joi.string().required(),
        password : Joi.string().required(),
        submit : Joi.string().required()
    });
    return loginSchema.validate(data)
};


const shopSchema = (data)=>{
    const schema = Joi.object().keys({
        name: Joi.string().alphanum().min(3).max(30).required(),
        phno: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
        email: Joi.string().email({ tlds: { allow: false } }),
        building: Joi.string().required(),
        licence : Joi.string().required(),
        registeration : Joi.string().required(),
        pincode: Joi.number().integer().required(),
        postoffice: Joi.string().required(),
        district: Joi.string().required(),
        state: Joi.string().required(),
        country: Joi.string().required(),
        password1: Joi.string().alphanum().min(3).max(30).required(),
        password2: Joi.ref('password1'),
        submit: Joi.required()
        });
        return schema.validate(data)
};

const medSchema = (data)=>{
    var schema = Joi.object().keys({
        name: Joi.string().required(),
        manfucater: Joi.string().required(),
        category: Joi.string().required(),
        date: Joi.required(),
        mrp: Joi.string().required(),
        price: Joi.string().required(),
        stock: Joi.string().required(),
        submit: Joi.required(),
    })
    return schema.validate(data)
}


    module.exports.userSchema = userSchema ; 
    module.exports.loginSchema = loginSchema;
    module.exports.shopSchema = shopSchema;
    module.exports.medSchema = medSchema;