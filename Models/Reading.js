var mongoose = require('mongoose');

var Schema = mongoose.Schema({
    number:       {type: Number},
    data:         {type: Date},    //todo: remove this unused field?
    shahed:       {type: String},
    content:      {type: String},
    sound:        {type: String},
    users_count:  {type: Number, default: 0},
    questions:[
      {
        //_id:                  will be auto-generated
        question:               {type: String},
        answer:                 {type: String},
        choices:                [],
        type:                   {type: String},
        score:                  {type: Number},
        answers_count:          {type: Number, default: 0},
        correct_answers_count:  {type: Number, default: 0}
      }
    ]
})

var Reading = mongoose.model("reading", Schema);

module.exports = Reading;