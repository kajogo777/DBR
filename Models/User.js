var mongoose = require('mongoose');

var Schema = mongoose.Schema({
    name:{type:String},
    username:{type:String},
    password:{type:String},
    level:{type:Number},
    score:{type:String}
})

  var User = mongoose.model("user", Schema);

  module.exports = User;