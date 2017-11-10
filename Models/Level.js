var mongoose = require('mongoose');

var Schema = mongoose.Schema({
    number:{type:Number},
    needed_score:{type:Number},
    users_count:{type:Number,default:0}
})

  var Level = mongoose.model("level", Schema);

  module.exports = Level;