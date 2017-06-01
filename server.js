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


app.get('/', function(req, res){
  res.render('partials/home', {searchType:'Last Name'});
});

app.post('/', function(req, res) {
  var searchQuery = req.body.searchQuery;
  // var searchCat = 'name'; //Current Search category
  var searchName = req.body.hasOwnProperty('lastNameBtn');
  var searchSport = req.body.hasOwnProperty('sportBtn');
  var searchCity = req.body.hasOwnProperty('cityBtn');
  if(req.body.hasOwnProperty('lastNameBtn')) {
    //Search Database for given lastname in searchQuery
    res.render('partials/home', {searchType:'Last Name'});
  }
  else if(req.body.hasOwnProperty('sportBtn')) {
    //Search Database for given lastname in searchQuery
    res.render('partials/home', {searchType:'Sport'});
  }
  else if(req.body.hasOwnProperty('teamBtn')) {
    //Search Database for given lastname in searchQuery
    res.render('partials/home', {searchType:'Team'});
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
      "team VARCHAR(255),"+
      "age INT,"+
      "weight INT,"+
      "height INT,"+
      "salary INT)";
      mysql.pool.query(createString, function(err){
        console.log('Athlete Table Created.')
        // res.redirect('/');
      })
    });
    mysql.pool.query("DROP TABLE IF EXISTS teams", function(err){ //replace your connection pool with the your variable containing the connection pool
        var createString = "CREATE TABLE teams("+
        "id INT PRIMARY KEY AUTO_INCREMENT,"+
        "teamname VARCHAR(255) NOT NULL,"+
        "city VARCHAR(255) NOT NULL,"+
        "numAthletes INT,"+
        "league VARCHAR(255),"+
        "sport VARCHAR(255),"+
        "payroll INT)";
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

  mysql.pool.query(
    "INSERT into athletes(firstname, lastname, team, age, height, weight, salary) values (?, ?, ?, ?, ?, ?, ?)",
    [firstName, lastName, team, age, height, weight, salary],
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

app.get('/add-team', function(req, res) {
  res.render('partials/add-team');
});

app.post('/search-lastname', function(req, res) {
  console.log(req.body)
})

app.listen(app.get('port'), function(){
    console.log("Server started on port " + app.get('port'));
    console.log("Press Ctrl-C to terminate");
});

module.exports = app;
