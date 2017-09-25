var mongoose = require('mongoose');

var Schema = mongoose.Schema({
    name:{type:String},
    username:{type:String},
    password:{type:String},
    level:{type:Number ,default:"1"},
    total_score:{type:Number, default: "0"},
    level_score:{type:Number, default: "0"},
    answered_questions:[
      {
        question_id:{type:String},
        right_answer: {type:Boolean},
        date:{type:Date}
      }
    ]
})

  var User = mongoose.model("user", Schema);

  module.exports = User;