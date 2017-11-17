(function(){
    'use strict';
    
    angular.module('readings')
    .service('dataService', DataService);
    
    DataService.$inject = ['$q', '$http', '$state', '$window'];
    function DataService($q, $http, $state, $window){
        var service = this;
        
        //holds a shortlist of all readings in the
        //database, where only '_id', 'number', and
        //'shahed' are retrieved
        service.readings = null;
        
        //flag to indicate if we need to retrieve
        //the readings shortlist from the server
        //examples: on initial run, after adding or
        //updating an existing reading on the server,
        //etc...
        var hasReadings = false;
        
        service.getReadings = function(){  //todo implement
            //return a promise for the state router,
            //which is different from the promise
            //returned by the $http service, so the
            //router won't go to the readingManager
            //state before the readings shortlist is
            //retrieved, and to keep all data handling
            //inside this service
            
            //initialize promise for "state's resolve"
            var deferred = $q.defer();
            //if we don't have the readings,
            //get them from the database
            if(hasReadings){
               deferred.resolve(service.readings);
            }else{
                var promise = $http.get(getBaseUrl()+'/get_readings');
                promise.then(function(response){
                    //handle $http response success
                    service.readings = response.data;
                    hasReadings = true;
                    deferred.resolve(service.readings);
                }, function(response){
                    //handle $http response failure
                    deferred.reject(response.data);
                });
            }
            return deferred.promise;
        };

        service.getReading = function(reading_id){ //todo implement
            //get the reading from the database,
            //and parse it to a Reading() object,
            //returns a promise (not $http's promise)
            //to the state's resolve property,
            //reading_id is a mongo ObjectID
            
            var deferred = $q.defer();
            $http.get(getBaseUrl()+'/get_reading/'+reading_id)
            .then(function(response){
                //success
                var reading = readingFromJson(response.data);
                deferred.resolve(reading);
            }, function(response){
                //fail
                deferred.reject(response.data);
            });
            return deferred.promise;
        };

        service.createReading = function(){
            //creates a new empty reading object
            //and returns it, for readingAdd
            //todo do we need to return a promise here?
            //for example, will the state change before
            //having a new reading object? and if so, is
            //this a problem?
            return new Reading();
        }

        service.addReading = function(reading){
            //push new reading to the server

            var deferred = $q.defer();
            var promise = $http.post(getBaseUrl()+'/add_reading',
                {'reading': reading});
            promise.then(function(res){
                //http success
                deferred.resolve();
                //mark that we don't have the latest
                //shortlist of readings, so they
                //would be retrieved again when going
                //to the readingManager
                hasReadings = false;
            }, function(res){
                //http fail
                deferred.reject();
            })
            return deferred.promise;
        }

        service.editReading = function(reading){
            //push updated reading to the server

            var deferred = $q.defer();
            var promise = $http.post(getBaseUrl()+'/update_reading',
                {'reading': reading});
            promise.then(function(res){
                //http success
                deferred.resolve();
                //mark that we don't have the latest
                //shortlist of readings, so they
                //would be retrieved again when going
                //to the readingManager
                hasReadings = false;
            }, function(res){
                //http fail
                deferred.reject();
            })
            return deferred.promise;
        }

        var getBaseUrl = function(){
            //return 'http://dbr.herokuapp.com';
            return $window.localStorage.getItem('base_url');
        }

        service.canEditReading = function(reading_number){
            //check if editing a reading is allowed

            //for now, editing is disabled for readings that
            //went live,
            //and enabled for editings that don't have
            //a valid reading_number
            //treats local time as the time used by server
            //todo feature improve method
            //todo check server's timezone

            //check if argument is valid number
            reading_number = parseInt(reading_number, 10);
            if(isNaN(reading_number)){
                return true;
            }
            var start_date = new Date(Date.UTC(2017, 11-1, 13));
            var current_date = new Date();
            var current_date_utc = new Date(
                Date.UTC(
                    current_date.getUTCFullYear(),
                    current_date.getUTCMonth(),
                    current_date.getUTCDate(),
                    current_date.getUTCHours(),
                    current_date.getUTCMinutes() - current_date.getTimezoneOffset(),
                    current_date.getUTCSeconds()
                )
            )
            // console.log('start:', start_date);
            // console.log('current:', current_date);
            // console.log('utc:', current_date_utc);
            var days_passed = ((current_date_utc - start_date)/1000/60/60/24) + 1;
            if(reading_number > days_passed){
                return true;
            }
            return false;
        }










        /* Readings model */
        /*
            To add a new question type (to the model):
            1. create the constructor
            2. add a case for the question type in Reading.questionAdd
            3. add a case for the question type in readingFromJson()
            To add the question to the view:
            - create its component
            - put a case for the component in readingEdit and readingView
            components
            - in reading Edit, add the question type option in 'select' of
            adding questions
        */

        //todo separate the model into its own service

        function Reading(){
            this.number = '',
            this.shahed = '',
            this.content = '',
            this.sound = '',
            this.questions = []
        }
        Reading.prototype.questionAdd = function(question_type){
            switch(question_type.toLowerCase()){
                case 'mcq':
                    var q = new QuestionMcq();
                    this.questions.push(q);
                    return q;
                    break;
                case 'essay':
                    var q = new QuestionEssay();
                    this.questions.push(q);
                    return q;
                    break;
                default:
                    return null;
                    break;
            }
        }
        Reading.prototype.questionRemove = function(question_index){
            //feature: check index bounds
            this.questions.splice(question_index, 1);
        }
        Reading.prototype.questionMoveUp = function(question_index){
            //moves the question inside the questions array
            //one step up
            //feature: check index bounds
            //check if not already at top
            if(question_index > 0){
                var tmp = this.questions[question_index];
                this.questions[question_index] = this.questions[question_index-1];
                this.questions[question_index-1] = tmp;
            }
        }
        Reading.prototype.questionMoveDown = function(question_index){
            //moves the question inside the questions array
            //one step down
            //feature: check index bounds
            //check if not already at the bottom
            if(question_index < this.questions.length-1){
                var tmp = this.questions[question_index];
                this.questions[question_index] = this.questions[question_index+1];
                this.questions[question_index+1] = tmp;
            }
        }
        
        /* MCQ question */
        function QuestionMcq(){
            this.type = 'mcq',
            this.question = '',
            this.answer = '',
            this.score = '',
            this.choices = [],
            this.id = questionGenereateId();
        }
        QuestionMcq.prototype.choiceAdd = function(choice_text){
            //add new choice to the array of choices,
            //Return true if added, false otherwise.
            //feature: check wrong argument type.
            //check if not empty or whitespaces only
            if(choice_text.trim().length !== 0){
                //check if not already exists in choices
                if(! this.choiceExists(choice_text)){
                    this.choices.push(choice_text);
                    return true;                    
                }
            }
            return false;
        }
        QuestionMcq.prototype.choiceRemove = function(choice_index){
            //feature: check index bounds
            this.choices.splice(choice_index, 1);
        }
        QuestionMcq.prototype.choiceIsCorrect = function(choice_index){
            //feature: check index bounds
            if(this.answer === this.choices[choice_index]){
                return true;
            }else{
                return false;
            }
        }
        QuestionMcq.prototype.choiceExists = function(choice_text){
            //feature: check bad argument
            for(var i=0; i<this.choices.length; i++){
                if(this.choices[i] === choice_text){
                    return true;
                }
            }
            return false;
        }
        QuestionMcq.prototype.choiceMoveUp = function(choice_index){
            //moves the choice inside the choices array
            //one step up
            //feature: check index bounds
            //check if not already at top
            if(choice_index > 0){
                var tmp = this.choices[choice_index];
                this.choices[choice_index] = this.choices[choice_index-1];
                this.choices[choice_index-1] = tmp;
            }
        }
        QuestionMcq.prototype.choiceMoveDown = function(choice_index){
            //moves the choice inside the choices array
            //one step down
            //feature: check index bounds
            //check if not already at the bottom
            if(choice_index < this.choices.length-1){
                var tmp = this.choices[choice_index];
                this.choices[choice_index] = this.choices[choice_index+1];
                this.choices[choice_index+1] = tmp;
            }
        }
        
        /* Essay question */
        //todo remove - QuestionEssay is for testing,
        //needs to be written correctly
        function QuestionEssay(){
            this.type = 'essay',
            this.question = '',
            this.answer = '',
            this.score = '',
            this.id = questionGenereateId();
        }
        QuestionEssay.prototype.checkAnswer = function(){
            if(this.answer === 'correct'){
                return true;
            }else{
                return false;
            }
        }

        function readingFromJson(reading_json){
            //simple way to re-construct a reading object from
            //output of JSON.parse (object), to include the methods
            //example usage:
            // var json = JSON.stringify(reading1);
            // var r2 = JSON.parse(json);
            // var reading2 = readingFromJson(r2);
            //Return: Reading() Object
            var reading = Object.assign(new Reading(), reading_json);
            reading.questions.forEach(function(question, question_index){
                switch (question.type.toLowerCase()){
                    case 'mcq':
                        reading.questions[question_index]
                            = Object.assign(new QuestionMcq(), reading_json.questions[question_index]);
                        break;
                    case 'essay':
                        reading.questions[question_index]
                            = Object.assign(new QuestionEssay(), reading_json.questions[question_index]);
                        break;
                    default:
                       break;
                }
            });
            return reading;
        }

        function questionGenereateId(){
            //generates an id
            //used for each question, instead of Mongo's _id
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
          
            for (var i = 0; i < 40; i++)
              text += possible.charAt(Math.floor(Math.random() * possible.length));
          
            return text;
        }











        /** Routing related **/

        service.goToReadingEdit = function(index){
            //go to editing view of reading
            //that has the passed array index

            var reading_id = service.readings[index]._id;
            $state.go('readingEdit', {id: reading_id});
        };

        service.goToReadingView = function(index){
            //go to viewing the reading that
            //has the passed array index

            var reading_id = service.readings[index]._id;
            $state.go('readingView', {id: reading_id});
        };
    }
})();