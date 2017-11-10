var mongoose = require('mongoose');

var Schema = mongoose.Schema({
        type:{type:String},
        title:{type:String},
        points:{type:Number},
        value:{type:Number},
        users_count:{type:Number,default:0}
})

  var Trophy = mongoose.model("trophy", Schema);

  module.exports = Trophy;