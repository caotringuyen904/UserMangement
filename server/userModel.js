const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    delete: {type:Boolean},
    email:{type:String, require:true},
    firstname:{type: String, require: true, unique:true},
    lastname:{type:String, require:true, unique:true},
    password:{type:String, require:true}
})

module.exports = mongoose.model("user",userSchema)  

