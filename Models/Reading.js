var mongoose = require('mongoose');

var Schema = mongoose.Schema({
    data: {type:Date},
    shahed:{type:String},
    content:{type:String},
    sound:{type:String},
    questions:[
      {
        question: {type:String},
        answer: {type:String},
        choices: [],
        type: {type:String},
        score: {type:String}
      }
    ]
})

  var Reading = mongoose.model("reading", Schema);

  module.exports = Reading;