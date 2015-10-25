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
		var sql_query = 'select id, username, password from user order by id asc';
		
		con.query(sql_query, function(err, itemrows) {
			console.log(itemrows)
			res.render('index', {itemrows: itemrows, title: 'Home'});
		});
	});

	app.post('/joinqueue', function(req, res, next) {
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
		var sql_query = "DELETE FROM `cutqueue`.`user` WHERE `id`='" + user.id + "';"
		console.log(sql_query)
		con.query(sql_query, function(err, rows){
			res.redirect('/')
		});
	});

	app.get('/queuer/login', function(req, res, next) {
		res.render('signin');
	});

	app.post('/queuer/login', function(req, res, next) {
		var user = req.body;
		var sql_query = "SELECT id FROM user WHERE username='" + user.username + "' and password = '" + user.password + "'";
		console.log(sql_query)
		con.query(sql_query, function(err, rows) {
			console.log(rows);
			if (rows.length == 1) {
				var canbid_query = "UPDATE `cutqueue`.`user` SET `canbid`='1' WHERE `id`='" + rows[0].id + "';"
				con.query(canbid_query, function(err, canbid_rows) {
					res.redirect('/queuer/' + rows[0].id);
				});
			} else {
				res.render('signin', {errorMessage: "Incorrect Name or Password"})
			};
		});
	});

	app.get('/linetraveller/login', function(req, res, next) {
		res.render('ltsignin');
	});

	app.post('/linetraveller/login', function(req, res, next) {
		var user = req.body;
		var sql_query = "SELECT id FROM user WHERE username='" + user.username + "' and password = '" + user.password + "'";
		console.log(sql_query)
		con.query(sql_query, function(err, rows) {
			console.log(rows);
			if (rows.length == 1) {
				res.redirect('/linetraveller/' + rows[0].id);
			} else {
				res.render('ltsignin', {errorMessage: "Incorrect Name or Password"})
			};
		});
	});

	app.get('/queuer/:id', function(req, res, next) {
		var user = req.params;
		var queue_query = 'select id, username, password from user order by id asc';
		
		con.query(queue_query, function(err, queuerows) {
			var bid_query = "SELECT id, bidding_for, bidder, bid_price FROM bid where bidding_for =" + user.id;
			console.log(bid_query);
			con.query(bid_query, function(err, bidrows) {
				res.render('userindex', {itemrows: queuerows, bidrows: bidrows, user_id: user.id, title: 'Cut My Queue'});
			});
		});
	});

	app.get('/linetraveller/:id', function(req, res, next) {
		var user = req.params;
		var queue_query = 'select id, username, password, canbid from user order by id asc';
		
		con.query(queue_query, function(err, queuerows) {
			res.render('travellerindex', {itemrows: queuerows, user_id: user.id, title: 'Cut My Queue'});
		});
	});

};





