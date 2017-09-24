var mongoose = require('mongoose');

var Schema = mongoose.Schema({
    number:{type:String},
    needed_score:{type:String}
})

  var Level = mongoose.model("level", Schema);

  module.exports = Level;