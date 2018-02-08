var mongoose = require('mongoose');

var Schema = mongoose.Schema({
    type:{type:String},
    date:{type:Date},
    points:{type:Number,default:0},
    user:{ type : mongoose.Schema.Types.ObjectId, ref: 'user'}
})

  var Event = mongoose.model("event", Schema);

  module.exports = Event;