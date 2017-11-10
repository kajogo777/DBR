var mongoose = require('mongoose');

var Schema = mongoose.Schema({
    level:{type:Number},
    title:{type:String},
    image:{type:String},
    count:{type:Number,default:"0"}
})

  var Gift = mongoose.model("gift", Schema);

  module.exports = Gift;