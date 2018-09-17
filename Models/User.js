var mongoose = require('mongoose');

var Schema = mongoose.Schema({
    name:                       {type: String},
    username:                   {type: String},
    password:                   {type: String},
    class:                      {type: String},
    level:                      {type: Number ,default: 1},
    total_score:                {type: Number, default: 0},
    level_score:                {type: Number, default: 0},
    admin:                      {type: Number, default: 0},
    birthday:                   {type: Date},
    reading_dates:              [{type: Date}],
    row_readings_count:         {type: Number, default: 0},
    row_correct_answer_count:   {type: Number, default: 0},
    answered_questions:[{
        _id: false,         //disable auto-generated _id field
        reading_id:         {type: mongoose.Schema.Types.ObjectId, ref: 'reading'},
        question_id:        {type: mongoose.Schema.Types.ObjectId},
                            //note: cannot reference a "subdocument" in another model
                            //see this for info: https://github.com/Automattic/mongoose/issues/2772
        user_answer:        {type:String},
        is_right_answer:    {type:Boolean},
        date:               {type:Date}
        // right_answer:       {type:String},
        // question:           {type:String},
        // choices:            [{type:String}],
        // score:              {type:String}
    }],
    trophies:[{
      trophy:   {type: mongoose.Schema.Types.ObjectId, ref: 'trophy'},
      date:     {type: Date}
    }],
    gift:       {type: mongoose.Schema.Types.ObjectId, ref: 'gift'}
})

var User = mongoose.model("user", Schema);

module.exports = User;