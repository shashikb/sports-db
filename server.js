var express = require('express');
var handlebars = require("express-handlebars").create({defaultLayout: "main"});
var bodyParser = require("body-parser");
var mysql = require('./dbcon.js');

var app = express();

app.set('port', 8000);
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

var dbObj = {};
var dbObj2 = {};
var editObj = {};
var athletePerTeam = {};
var lastNameBool = false;
var almaMaterBtnBool = false;
var teamBtnBool = false;
var cityBtnBool = false;
var searchType = 'Last Name';
var refineSearchBool = false;
var editFieldBool = false;


app.get('/', function(req, res){
  console.log("editFieldBool = ", editFieldBool);
  res.render('partials/home', {
    searchType: searchType,
    dbObj: dbObj,
    dbObj2: dbObj2,
    athletePerTeam: athletePerTeam,
    lastNameBool: lastNameBool,
    teamBtnBool: teamBtnBool,
    refineSearchBool: refineSearchBool,
    almaMaterBtnBool: almaMaterBtnBool,
    editFieldBool: editFieldBool,
    cityBtnBool: cityBtnBool,
    editObj: editObj
  });
});

app.post('/get-query', function(req, res) {
  var searchQuery = req.body.searchQuery;
  // var searchCat = 'name'; //Current Search category
  var searchName = req.body.hasOwnProperty('lastNameBtn');
  var searchSport = req.body.hasOwnProperty('sportBtn');
  var searchCity = req.body.hasOwnProperty('cityBtn');
  console.log("hasOwnProperty value = ", req.body);
  console.log("hasOwnProperty value = ", req.body);

  if(req.body.hasOwnProperty('lastNameBtn')) {
    //Search Database for given lastname in searchQuery
    console.log('Searching last name: ', searchQuery)
    mysql.pool.query("SELECT * FROM `athletes` WHERE `lastname` = '" + searchQuery + "'" , function(err, rows, fields) {
      // res.render('partials/home', {searchType:'Not', dbDataObj: rows, lastNameBool: true});
      console.log('searchQuery = ', searchQuery);
      console.log(rows);
      searchType = 'Last Name';
      dbObj = rows;
      lastNameBool = true;
      sportsBtnBool = false;
      teamBtnBool = false;
      req.body.lastNameBtn = false;
      res.redirect('/');
    });

  }
  else if(req.body.hasOwnProperty('cityBtn')) {
    var cityObj = {};
    mysql.pool.query("SELECT * FROM cities WHERE `cityname` = '" + searchQuery + "'", function(err, rows, fields) {
      console.log(rows);//city object from database saved here.
      //parse obj here.
      mysql.pool.query("SELECT * FROM teams WHERE `city` = '" + searchQuery + "'", function(err2, rows2, fields2) {
        console.log(rows2);
        searchType = 'City';
        dbObj = rows;
        dbObj2 = rows2;
        lastNameBool = false;
        sportsBtnBool = false;
        teamBtnBool = false;
        almaMaterBtn = false;
        cityBtnBool = true;
        req.body.lastNameBtn = false;
        res.redirect('/');
      });
    });
  }
  else if(req.body.hasOwnProperty('almaMaterBtn')) {
    var almaMaterObj = {};
    mysql.pool.query("SELECT * FROM almaMater WHERE `schoolName` = '" + searchQuery + "'", function(err, rows, fields) {
      console.log(rows);
      almaMaterObj.name = rows[0].schoolname;

      mysql.pool.query("SELECT * FROM cities WHERE `id` = '" + rows[0].city + "'", function(err2, rows2, field2) {
        console.log(rows2);
        almaMaterObj.city = rows2[0].cityname;
        almaMaterObj.state = rows2[0].state;
        almaMaterObj.mascotName = rows[0].mascot;
        almaMaterObj.studentPop = rows[0].studentPop;

        for(var key in almaMaterObj) {
          console.log(almaMaterObj[key]);
        }
        searchType = 'Alma Mater';
        dbObj = almaMaterObj;
        lastNameBool = false;
        sportsBtnBool = false;
        teamBtnBool = false;
        almaMaterBtnBool = true;
        req.body.lastNameBtn = false;
        res.redirect('/');
      });
    });
    // res.render('partials/home', {searchType:'almaMaterBtn'});
  }
  else if(req.body.hasOwnProperty('teamBtn')) {
    mysql.pool.query("SELECT * FROM `teams` WHERE `teamname` = '" + searchQuery + "'" , function(err, rows, fields) {
      mysql.pool.query("SELECT * FROM `athletes` WHERE `team` = '" + rows[0].id + "'", function(err2, rows2, fields2) {
        if(err) {
          console.log(err);
        }
        searchType = 'Team';
        dbObj = rows;
        athletePerTeam = rows2;
        lastNameBool = false;
        sportsBtnBool = false;
        teamBtnBool = true;
        res.redirect('/');
      });
    });
  }
});

/*
*   This route is for creating the tables in the database. Run this route and
*   tables will be built in the database. If the table already exists and this
*   route is accessed, the tables will be reset. If the tables don't exist, the
*   tables will be made.
*/

app.get('/create-table', function(req, res) {
  mysql.pool.query("DROP TABLE IF EXISTS athletes", function(err){ //replace your connection pool with the your variable containing the connection pool
      var createString = "CREATE TABLE athletes("+
      "id INT PRIMARY KEY AUTO_INCREMENT,"+
      "firstname VARCHAR(255) NOT NULL,"+
      "lastname VARCHAR(255) NOT NULL,"+
      "team INT,"+
      "age INT,"+
      "weight INT,"+
      "height INT,"+
      "salary INT,"+
      "FOREIGN KEY (team) REFERENCES teams(id))";
      mysql.pool.query(createString, function(err){
        if(err) {
          console.log(err);
        }
        console.log('Athlete Table Created.')
        // res.redirect('/');
      })
    });
    mysql.pool.query("DROP TABLE IF EXISTS teams", function(err){ //replace your connection pool with the your variable containing the connection pool
        var createString = "CREATE TABLE teams("+
        "id INT PRIMARY KEY AUTO_INCREMENT,"+
        "teamname VARCHAR(255) NOT NULL,"+
        "city VARCHAR(255) NOT NULL,"+
        "league VARCHAR(255),"+
        "sport VARCHAR(255),"+
        "payroll INT)";
        mysql.pool.query(createString, function(err){
          console.log('Teams Table Created.')
          // res.redirect('/');
        })
      });
    mysql.pool.query("DROP TABLE IF EXISTS almaMater", function(err){ //replace your connection pool with the your variable containing the connection pool
        var createString = "CREATE TABLE almaMater("+
        "id INT PRIMARY KEY AUTO_INCREMENT,"+
        "schoolname VARCHAR(255) NOT NULL,"+
        "city INT NOT NULL,"+
        "mascot VARCHAR(255),"+
        "studentPop INT,"+
        "FOREIGN KEY (city) REFERENCES cities(id))";
        mysql.pool.query(createString, function(err){
          console.log('Alam Mater Table Created.')
          // res.redirect('/');
        })
      });
    mysql.pool.query("DROP TABLE IF EXISTS cities", function(err){ //replace your connection pool with the your variable containing the connection pool
        var createString = "CREATE TABLE cities("+
        "id INT PRIMARY KEY AUTO_INCREMENT,"+
        "cityname VARCHAR(255) NOT NULL,"+
        "state VARCHAR(255),"+
        "population INT ,"+
        "teams INT,"+
        "almamater INT,"+
        "FOREIGN KEY (teams) REFERENCES teams(id)," +
        "FOREIGN KEY (almamater) REFERENCES almaMater(id))";
        mysql.pool.query(createString, function(err){
          console.log('Teams Table Created.')
          res.redirect('/');
        })
      });
})

app.post('/select-name', function(req, res) {
  console.log('name selected');
})

app.get('/add-athlete', function(req, res) {
  res.render('partials/add-athlete');
});

app.post('/add-athlete', function(req, res) {
  var athleteObj = {};
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var team = req.body.teamName;
  var age = req.body.age;
  var height = req.body.height;
  var weight = req.body.weight;
  var salary = req.body.salary;

  mysql.pool.query("SELECT * FROM `teams` where `teamname` = '" + team + "'", function(err, rows, fields) {
    //If error in finding team name in database, then throw error
    if(err) {
      console.log("error for some reason");
      console.log(err);
    }
    //If team name we are attempting to add to exists in the teams db, then add the id of that team to field.
    else {
      if(rows.length > 0){
        mysql.pool.query(
          "INSERT into athletes(firstname, lastname, team, age, height, weight, salary) values (?, ?, ?, ?, ?, ?, ?)",
          [firstName, lastName, rows[0].id, age, height, weight, salary],
          function(err, result) {
            if(err) {
              next(err);
              return;
            }
            console.log('Inserted into id: ', result.id)
          }
        )
        res.redirect('/');
      }
      else {
        //Team does not exist, redirect to add team?
        console.log('reaching');
        res.redirect('/dne/add-team');
      }
    }
  });
});

app.get('/add-team', function(req, res) {
  res.render('partials/add-team', {teamDNEbool: false});
});
app.get('/dne/add-team', function(req, res) {
  res.render('partials/add-team', {teamDNEbool: true});
});

app.post('/add-team', function(req, res) {
  var teamObj = {};
  var teamName = req.body.teamName;
  var cityName = req.body.cityName;
  var sportName = req.body.sportName;
  var leagueName = req.body.leagueName;
  var payroll = req.body.payroll;
  //Eventually add athletes here.

  mysql.pool.query(
    "INSERT into teams(teamname, city, league, sport, payroll) values (?, ?, ?, ?, ?)",
    [teamName, cityName, leagueName, sportName, payroll],
    function(err, result) {
      if(err) {
        next(err);
        return;
      }
      console.log('Inserted into id: ', result.id)
    }
  )
  res.redirect('/');
});

/*
*   Route to add city to database.
*/
app.get('/add-city', function(req, res) {
  res.render('partials/add-city');
});

app.post('/add-city', function(req, res) {
  var cityObj = {};
  var cityName = req.body.cityName;
  var stateName = req.body.stateName;
  var cityPop = req.body.cityPop;
  console.log(cityName);
  mysql.pool.query(
    "INSERT into cities(cityname, state, population) values (?, ?, ?)",
    [cityName, stateName, cityPop],
    function(err, result) {
      if(err) {
        console.log(err);
      }
      else {
        console.log('Inserted into cities');
      }
    }
  )
  res.redirect('/');
});

app.get('/add-alma-mater', function(req, res) {
  res.render('partials/add-alma-mater', {teamDNEbool: false});
});

app.post('/add-alma-mater', function(req, res) {
  var schoolName = req.body.schoolName;
  var cityName = req.body.city;
  var mascotName = req.body.mascotName;
  var studentPop = req.body.studentPop;

  mysql.pool.query("SELECT * FROM `cities` where `cityname` = '" + cityName + "'", function(err, rows, field) {
    console.log(rows);
    var cityId = rows[0].id;
    if(rows.length > 0) {
      //do stuff.
      mysql.pool.query(
        "INSERT INTO almaMater(schoolname, city, mascot, studentPop) values (?, ?, ?, ?)",
        [schoolName, cityId, mascotName, studentPop], function(err, result) {
          if(err) {
            console.log(err);
            return;
          }
          else {
            console.log("added into alma mater table.");
            res.redirect('/');
          }
        }
      )
    }
    else {
      //render add city page with message that city we are trying to add alma mater to doesn't exist yet.
      //Please add.
      res.redirect('/dne/alma-city');
    }
  });
});

app.get('/dne/alma-city', function(req, res) {
  res.render('partials/add-city', {cityDNEbool: true});
});

app.post('/edit-or-delete', function(req, res) {
  console.log(req.body);
  if(req.body.hasOwnProperty('edit')) {
    mysql.pool.query('SELECT * FROM `athletes` where `id` = (?)', [req.body.edit], function(err, results, fields) {
      editFieldBool = true;
      editObj = results;
      res.redirect('/');
    });
  }
  else if(req.body.hasOwnProperty('delete')) {
    console.log("enissss");
    console.log(req.body)
    mysql.pool.query('DELETE FROM `athletes` WHERE `id` = (?)', [req.body.delete], function (error, results, fields) {
      mysql.pool.query('SELECT * FROM `athletes`', function(err2, results2, fields2) {
        console.log(results2);
        dbObj = results2;
        res.redirect('/');
      });
    });
  }
});

app.post('/edit', function(req, res) {
  var newObj = {};
  mysql.pool.query("UPDATE `athletes` SET firstname=?, lastname=?, team=?, age =?, weight=?, height=?, salary=? WHERE id=? ",
    [req.body.fname, req.body.lname, req.body.teamname, req.body.age, req.body.weight, req.body.height, req.body.salary, req.body.submit],
    function(err, result){
    if(err){
      next(err);
      return;
    }
    mysql.pool.query('SELECT * FROM `athletes` where `lastname` = (?)', [req.body.lname], function(err, results, fields) {
      editFieldBool = false;
      console.log(results);
      dbObj = results;
      res.redirect('/');
    });

  });
});

/*
*   toggle-refine
*   This route handles the toggle button to further refine a search. Starts off
*   as false but then alternates to true/false every time the button is pressed.
*/
app.post('/toggle-refine', function(req, res) {
  refineSearchBool = !refineSearchBool;
  console.log(refineSearchBool)
  res.redirect('/');
})

app.post('/toggle-refine-search-bool', function(req, res) {
  console.log('changing to true');
  refineSearchBool = !refineSearchBool;
  res.redirect('/');
});

app.listen(app.get('port'), function(){
    console.log("Server started on port " + app.get('port'));
    console.log("Press Ctrl-C to terminate");
});

module.exports = app;
