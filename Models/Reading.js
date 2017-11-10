var mongoose = require('mongoose');

var Schema = mongoose.Schema({
    number:{type:String},
    data: {type:Date},
    shahed:{type:String},
    content:{type:String},
    sound:{type:String},
    users_count: {type:Number,default:0},
    questions:[
      {
        question: {type:String},
        answer: {type:String},
        choices: [],
        type: {type:String},
        score: {type:String},
        id:{type:String},
        answers_count: {type:Number,default:0},
        correct_answers_count:  {type:Number,default:0}
      }
    ]
})

  var Reading = mongoose.model("reading", Schema);

  module.exports = Reading;