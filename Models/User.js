var mongoose = require('mongoose');

var Schema = mongoose.Schema({
    name:{type:String},
    username:{type:String},
    password:{type:String},
    level:{type:Number ,default:"1"},
    total_score:{type:Number, default: "0"},
    level_score:{type:Number, default: "0"},
    reading_dates:[],
    answered_questions:[
      {
        question_id:{type:String},
        is_right_answer: {type:Boolean},
        user_answer:{type:String},
        right_answer:{type:String},
        question:{type:String},
        choices:[{type:String}],
        score:{type:String},
        date:{type:Date}
      }
    ]
})

  var User = mongoose.model("user", Schema);

  module.exports = User;