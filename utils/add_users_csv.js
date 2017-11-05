/*
Reads a csv file,
extracts list of users,
adds them to database

Example file showing all file rules:

    #all lines starting with # are comments
    #and will be ignored.
    #all whitespace lines will be ignored.
    
    #all lines whose columns are whitespace only will
    #be ignored
    ,,

    #class name should be first non-ignored-line in file,
    #and if line has columns, the class name must be in the
    #first column
    St. Andrew,,
    
    #Full Name, #username, #birthday
    John Doe, john.doe, 31/12/2005
    Foo Bar, foo.bar, 05/06/2006
    ,,
    ,,
    ,,
    #birthday separator is a '/'
    #birthday is d/m/yyyy
    #birthday day and month with OR without leading zeroes
    #username should not have spaces (not checked here (todo feature))
*/

var fs = require('fs');
var os = require('os'); //for EOL character
var mongoose = require('mongoose');

//MongoDB url
var f = require('util').format;
var db_user = encodeURIComponent('admin');
var db_password = encodeURIComponent('admin');
var db_base_url = 'ds147964.mlab.com:47964/dbr';
var DB_URI = f('mongodb://%s:%s@%s', db_user, db_password, db_base_url);

var User = require('../Models/User');

//get arguments
args = process.argv.splice(2);
//console.log("Got " + args.length + " argument(s): " + args);

if(args.length !== 1){
    console.log('Error: Wrong number of arguments');
    console.log('Usage: node add_users_csv.js <csv-filename>')
    process.exit(1);
}else{
    var input_filename = args[0];
    try{
        var input = fs.readFileSync(input_filename, 'utf-8');
    } catch(err){
        console.log('Error opening file (' + input_filename + ')');
        console.log(err.toString());
        process.exit(1);
    }
    console.log('File opened successfully (' + args[0] + ')');
    var input_lines = input.split(os.EOL);
    var class_name;
    var user_list = [];
    for(i=0; i<input_lines.length; i++){
        //ignore comments (comments are *whole* lines that start with #)
        var line = input_lines[i].trim();
        var line_number = i+1;
        if(line[0] === "#"){
            //console.log('skipping comment line ' + (line_number));
            continue;
        }
        //ignore whitespace lines
        if(line.length === 0){
            //console.log('skipping empty line ' + (line_number));
            continue;
        }
        //ignore lines whose all columns are whitespace only
        var tmp_tokens = line.split(',');
        var do_ignore = true;
        for(var j=0; j<tmp_tokens.length; j++){
            if(tmp_tokens[j].trim().length !== 0){
                do_ignore = false;
                break;
            }
        }
        if(do_ignore){
            continue;
        }
        //reaching here: current line is not ignored
        //first non-ignored line is class name
        if(class_name === undefined){
            //then this line is class name
            class_name = line.split(',')[0];
        }else{
            //then this line is a user entry
            tokens = line.split(',');
            //check correct number of columns in the line
            if(tokens.length !== 3){
                exit_error('wrong number of columns', line_number, input_filename);
            }
            //check bad column values
            var full_name = tokens[0].trim();
            var user_name = tokens[1].trim();
            var birthday = tokens[2].trim();
            if(full_name.length === 0){
                exit_error('bad full name', line_number, input_filename);
            }else if(user_name.length === 0){
                exit_error('bad username', line_number, input_filename);
            }else if(birthday.length === 0){
                exit_error('bad birthday', line_number, input_filename);
            }
            //break down birthday
            var parts, year, month, day;
            parts = birthday.split('/');
            day = parts[0].trim();
            if(day.length < 2){
                day = '0' + day;
            }
            month = parts[1].trim();
            if(month.length < 2){
                month = '0' + month;
            }
            year = parts[2].trim();
            
            //add user to temp list
            var user = new User();
            user.name = full_name;
            user.username = user_name;
            user.password = day + month;
            user.birthday = new Date(Date.UTC(year, month-1, day));
            user.class = class_name;
            user.admin = -5; //todo important: temp, for easy deletion in db
            user_list.push(user);
        }
    }
    //reaching here means no errors
    console.log('Finished processing file (' + input_filename + ')');
    if(user_list.length !== 0){
        console.log('Found (' + user_list.length + ') users in file (' +
            input_filename + ')', ', Class name: ' + class_name);
        //console.log(user_list);
        pushToDatabase();
    }else{
        console.log('Found no users in file (' + input_filename + ')');
    }
}

function pushToDatabase(){
    var conn = mongoose.connect(DB_URI, function(err){
        if(err){
            //console.log(err);
            console.log('Error: connection to MongoDB failed');
            console.log('Aborting...');
        }else{
            console.log('Connected to MongoDB...');
        }
    });
    User.collection.insert(user_list, function(err){
        if(err){
            //to test this: try to insert one object
            //with duplicate _id
            console.log(err);
            console.log('Error on inserting users to db...');
            console.log('Aborting...');
            conn.disconnect();
        }else{
            console.log('Finished inserting users');
            console.log('No guarantee that there were no errors!');
            //todo feature: check for insertion errors, probably by
            //default if one of the objects in list gives an error,
            //the remaining objects are inserted normally
            conn.disconnect();
        }
    });
}

function exit_error(msg, line_number, filename){
    console.log('error: ' + msg + ' at line ' + line_number + ' (' + filename + ')');
    process.exit(1); //exit with failure
}
