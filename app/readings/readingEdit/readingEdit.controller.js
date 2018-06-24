(function(){
    'use strict';
    
    angular.module('readings')
    .controller('readingEditController', ReadingEditController);

    ReadingEditController.$inject = ['dataService', '$state', 
        '$mdDialog', 'toastr', 'bibleService'];
    function ReadingEditController(dataService, $state, $mdDialog, toastr, bibleService){
        var $ctrl = this;

        //Note (FOR questions components):
        //although it's against the components design way
        //to change the bound objects or arrays inside the component
        //because these changes affect the passed object/array (because
        //it's a reference), this will be ignored here, each
        //question component will handle the question object by itself
        //and for any required function calls to the parent, such as
        //delete question, which needs to be in the 'reading' context,
        //not in the 'questionMcq' context for example, the question
        //component may simply ask the injected service 'dataService',
        //or don't let the question handles deleting (or anything outside
        //its context), but rather let the parent handle this, i.e. put
        //the delete button on the readingEdit template

        //feature: confirm before deleting a question
        //feature: fix page scroll on question re-order, OR:
        //feature: add better question re-ordering functionality


        /* Insert Content and Shahed */
        $ctrl.$onInit = function() {
            bibleService.getBooksNames(function(err, names) {
                if (err) return;
                $ctrl.insert_book_names = names;
            });
        }
        $ctrl.insert_book = "";
        $ctrl.insert_chapter;
        $ctrl.insert_verse_start;
        $ctrl.insert_verse_end;
        //todo: add inputs to enable user to change these options
        //todo: add option to change verses join method (newline vs single paragraph)
        //todo: use book metadata to clamp the maximum value of verse_start and verse_end
        //      so the user can just enter a very large value in verse_end to get last verse
        //      automatically
        $ctrl.insert_diacritices = 1;
        $ctrl.insert_number_verses = true;
        $ctrl.insertContent = function($event) {
            var book = $ctrl.insert_book;
            var chapter = $ctrl.insert_chapter;
            var verse_start = $ctrl.insert_verse_start;
            var verse_end = $ctrl.insert_verse_end;
            if (! (book && chapter && verse_start) ) {  //verse_end is optional
                return;
            }
            bibleService.validateShahed(book, chapter, verse_start, verse_end)
            .then(function() {
                //if reading's content and shahed are empty, don't
                //ask user for confirmation
                if (!$ctrl.reading.content && !$ctrl.reading.shahed) {
                    return;
                }
                return showDialogConfirm($event, {
                    message_text: 'This will overwrite the current ' + 
                        '"Content" and "Shahed", are you sure?'
                })
            })
            .then(function() {
                //get the verses,
                //if the user omitted the verse_end, assume
                //it's the same as verse_start, i.e. get one verse
                verse_end = verse_end ? verse_end : verse_start;
                return bibleService.getBibleChapter({
                    book: book,
                    chapter: chapter,
                    verse_start: verse_start,
                    verse_end: verse_end,
                    diacritics: $ctrl.insert_diacritices,
                    number_verses: $ctrl.insert_number_verses
                })
            })
            .then(function(chapter) {
                //update reading's content and shahed with new ones
                $ctrl.reading.shahed = bibleService.getShahedString(chapter.book_name_short,
                    chapter.chapter, verse_start, verse_end);
                $ctrl.reading.content = chapter.verses.join('\n');
            })
            .catch(function(err) {
                if (err) {
                    toastr.error(err);
                }
            })
        }


        /* Sound Link */
        //todo: optional - you can check for the sound file size
        //using a HTTP HEAD request (using XMLHttpRequest, or Angular's
        //$http for example) and read the 'content-length' header,
        //but this is not doable with domains other than origin (CORS),
        //although note that media elements are not affected by
        //Cross-origin policy, for example: <img> or <audio> elements
        //can load media from cross-origin URLs
        $ctrl.soundDirectLink = function($event) {
            showDialogPrompt($event, {
                title_text: 'Direct Link',
                message_text: 'Enter direct link to the sound file'
            })
            .then(function(link) {
                if (link.trim() == '') {
                    return;
                }
                $ctrl.reading.sound = link;
            })
            .catch(function() {/* do nothing */})
        }
        $ctrl.soundGoogleDriveLink = function($event) {
            showDialogPrompt($event, {
                title_text: 'Google Drive Link',
                message_text: 'Enter Google Drive link of sound file'
            })
            .then(function(link) {
                //convert google drive sharing links to direct links
                //idea taken from the script used in this site:
                //https://www.wonderplugin.com/online-tools/google-drive-direct-link-generator/
                if (link.trim() == '') {
                    return;
                }
                var re = /\S*drive.google.com\/\S*id=(\S+)\S*/;
                var results = re.exec(link);
                if (results) {
                    $ctrl.reading.sound = 'https://drive.google.com/uc?export=download&id=' +
                                            results[1];
                } else {
                    //tell the user they entered invalid link,
                    //don't change the current link
                    toastr.error('Invalid Google drive link');
                }
            })
            .catch(function() {/* do nothing */})
        }
        $ctrl.soundRemoveLink = function($event) {
            showDialogConfirm($event)
            .then(function() {
                $ctrl.reading.sound = '';
            })
            .catch(function() {/* do nothing */})
        }
        $ctrl.$postLink = function() {
            //add event listener for <audio> error event
            //to detect added invalid URLs
            var player = document.querySelector('.audio-player');
            player.addEventListener('error', function(e) {
                //if the error is because the sound link is empty string
                //(which is the case initially or after removing the
                //sound link), ignore it
                if ($ctrl.reading.sound == '') {
                    return;
                }
                //error can arise even if URL is valid, when internet
                //connection is lost for example, so don't remove the
                //link, just warn the user
                toastr.error("Error playing sound file, sound link may be invalid");
            })
        }

        $ctrl.new_question_type = 'mcq';
        $ctrl.questionAdd = function(){
            //check if a question type is selected
            if($ctrl.new_question_type !== ''){
                $ctrl.reading.questionAdd($ctrl.new_question_type);
                //don't reset the selected question type for convenience
                // $ctrl.new_question_type = '';
            }
        }

        //false when:
        //- currently saving, to disable
        //  the save button, and further save requests,
        //- and after saving successfully,
        //- todo: and when inputs are still invalid
        $ctrl.can_save = true;
        //message displayed when saving
        $ctrl.save_msg = '';
        $ctrl.show_save_msg = false;
        $ctrl.save = function(){
            //push the reading to the server to save changes

            $ctrl.can_save = false;

            //reset possible previous error message
            $ctrl.show_save_msg = true;
            $ctrl.save_msg = 'Saving... please wait.';

            //first check if we're editing an existing reading
            //or adding a new one
            if($ctrl.reading.hasOwnProperty('_id')){
                //there is an _id key, it's an edit to existing reading
                var promise = dataService.editReading($ctrl.reading);
                promise.then(function(){
                    //reading update success
                    $state.go('readingManager');
                }, function(){
                    //reading update fail
                    $ctrl.save_msg = 'Failed to update reading, please try again';
                    $ctrl.can_save = true;
                })
            }else{
                //...else, it's: add new reading
                var promise = dataService.addReading($ctrl.reading);
                promise.then(function(){
                    //reading add success
                    $state.go('readingManager');
                }, function(){
                    //reading add fail
                    $ctrl.save_msg = 'Failed to add reading, please try again';
                    $ctrl.can_save = true;
                })
            }
        };
        $ctrl.discard = function($event){
            //todo: feature - check if inputs where $touched
            //todo: feature - handle browser back button, currently
            //it is silent with no warnings
            showDialogConfirm($event, {
                message_text: 'Are you sure you want to discard any changes?',
                confirm_text: 'Discard',
                cancel_text: 'Cancel'
            })
            .then(function() {
                $state.go('readingManager');
            })
            .catch(function() {/* do nothing */})
        };


        /* Dialogs */
        function showDialogConfirm($event, options) {
            /*
                shows a modal dialog with a message and two buttons for confirmation
                
                Returns: a promise that resolves if user confirmed, and rejects if
                user canceled

                options = {
                    message_text,       //the message
                    confirm_text,       //confirm button
                    cancel_text,        //cancel button
                }
            */
            options = options || {};    //safe guard to enable later code to use options.something
                                        //even if the user omitted the options argument as a whole
            return $mdDialog.show({
                targetEvent: $event,    //makes the location of the click be used as the starting
                                        //point for the opening animation of the dialog
                templateUrl: 'readings/readingEdit/readingEdit.confirm.dialog.html',
                onComplete: function($scope, element, options) {
                    //runs after open dialog animation,
                    //focus on dialog,
                    //otherwise, pressing 'Enter' will re-open the dialog,
                    //because focus remains on the button that opened the dialog,
                    //(although this should be achieved by focusOnOpen,
                    //but it had some issues), and in both cases, there is a time
                    //window during animation where you can press 'Enter' before
                    //focus actually shifts to the dialog or the dialog's
                    //close button for example
                    element.focus();
                },
                controller: function($scope, $mdDialog) {
                    $scope.message_text = options.message_text || 'Are you sure?';
                    $scope.confirm_text = options.confirm_text || 'Yes';
                    $scope.cancel_text  = options.cancel_text  || 'Cancel';
                    $scope.confirm = function() {
                        $mdDialog.hide();   //closes the last opened dialog,
                                            //and resolves the promise returned by show()
                    }
                    $scope.cancel = function() {
                        $mdDialog.cancel(); //closes the last opened dialog,
                                            //and rejects the promise returned by show()
                    }
                }
            })
        }

        function showDialogPrompt($event, options) {
            options = options || {};    //safe guard to enable later code to use options.something
                                        //even if the user omitted the options argument as a whole
            return $mdDialog.show({
                targetEvent: $event,    //makes the location of the click be used as the starting
                                        //point for the opening animation of the dialog
                templateUrl: 'readings/readingEdit/readingEdit.prompt.dialog.html',
                onComplete: function($scope, element, options) {
                    //runs after open dialog animation,
                    //focus on dialog's input box,
                    //otherwise, pressing 'Enter' will re-open the dialog,
                    //because focus remains on the button that opened the dialog,
                    //(although this should be achieved by focusOnOpen,
                    //but it had some issues), and in both cases, there is a time
                    //window during animation where you can press 'Enter' before
                    //focus actually shifts to the dialog or the dialog's
                    //close button for example
                    element.find('input')[0].focus();       //jqLite supports only tag names
                },
                controller: function ($scope, $mdDialog) {
                    $scope.title_text   = options.title_text   || '';
                    $scope.message_text = options.message_text || '';
                    $scope.confirm_text = options.confirm_text || 'OK';
                    $scope.cancel_text  = options.cancel_text  || 'Cancel';
                    $scope.result       = options.result;
                    $scope.confirm = function () {
                        //closes the last opened dialog,
                        //and resolves the promise returned by show(),
                        //passing the input value
                        $mdDialog.hide($scope.result);   
                    }
                    $scope.cancel = function () {
                        //closes the last opened dialog,
                        //and rejects the promise returned by show()
                        $mdDialog.cancel();
                    }
                }
            })
        }
    }
    
})();