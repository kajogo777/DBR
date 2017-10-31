var mongoose = require('mongoose');

var Schema = mongoose.Schema({
        type:{type:String},
        title:{type:String},
        points:{type:String},
        value:{type:String}
})

  var Trophy = mongoose.model("trophy", Schema);

  module.exports = Trophy;