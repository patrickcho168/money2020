var bodyParser = require('body-parser')
var mysql = require('mysql');
var moment = require('moment');

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

var allModel = require('../models/all-model');

var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "pat@ncsv27",
	database: "freemie"
});

con.connect(function(err){
	if(!err) {
	 console.log("Database is connected ... \n\n");  
	} else {
	 console.log("Error connecting database ... \n\n");  
	}
});

con.query('USE cutqueue');

var siteName = "localhost:3000";

module.exports = function(app) {

	// index page
	app.get('/', function(req, res, next) {
		var sql_query = 'select id, username, password from user where served = 0 order by id asc';
		
		con.query(sql_query, function(err, itemrows) {
			console.log(itemrows)
			res.render('signin', {itemrows: itemrows, title: 'Home'});
		});
	});

	app.post('/signin', function(req, res, next) {
		var queuer = req.body;
		var sql_query = "INSERT INTO `cutqueue`.`user` (`username`, `password`) VALUES ('" + queuer.username + "', '" + queuer.password + "');"
		console.log(sql_query)
		con.query(sql_query, function(err, rows){
			res.redirect('/')
		});

	});

	app.post('/served/:id', function(req, res, next) {
		var user = req.params;
		console.log(user.id)
		var sql_query = "UPDATE `cutqueue`.`User` SET `served`='1' WHERE `id`='" + user.id + "';"
		console.log(sql_query)
		con.query(sql_query, function(err, rows){
			res.redirect('/')
		});
	});


};





