var mongoose = require('mongoose');

var Schema = mongoose.Schema({
    name:{type:String},
    username:{type:String},
    password:{type:String},
    class:{type:String},
    level:{type:Number ,default:1},
    total_score:{type:Number, default: 0},
    level_score:{type:Number, default: 0},
    admin:{type:Number, default: 0},
    birthday:{type:Date},
    reading_dates:[],
    row_readings_count:{type:Number, default: 0},
    row_correct_answer_count:{type:Number, default: 0},
    answered_questions:[
      {
        question_id:{type:String},
        reading_id:{type:String},
        is_right_answer: {type:Boolean},
        user_answer:{type:String},
        right_answer:{type:String},
        question:{type:String},
        choices:[{type:String}],
        score:{type:String},
        date:{type:Date}
      }
    ],
    trophies:[{
      trophy:{ type : mongoose.Schema.Types.ObjectId, ref: 'trophy' },
      date:{type:Date}
      }
    ]
})

  var User = mongoose.model("user", Schema);

  module.exports = User;