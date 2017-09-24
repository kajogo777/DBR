var mongoose = require('mongoose');

var Schema = mongoose.Schema({
    name:{type:String},
    username:{type:String},
    password:{type:String},
    level:{type:Number ,default:"1"},
    score:{type:String, default: "0"}
})

  var User = mongoose.model("user", Schema);

  module.exports = User;