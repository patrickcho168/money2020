var bodyParser = require('body-parser')
var mysql = require('mysql');
var moment = require('moment');

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();
var braintree = require('braintree');

var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "freemie"
});

var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: '2677fhnwncmtzpdp',
  publicKey: '24ck88nkh4ytcdqt',
  privateKey: '9bddeff3ea84b7a89144e7a60d11c80f'
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
				res.render('index2', {bidding_for: user.id});
			});
		});
	});

	app.get('/login', function(req, res, next) {
		res.render('login');
	});

	app.get('/linetraveller/:id', function(req, res, next) {
		var user = req.params;
		var queue_query = 'select id, username, password, canbid from user order by id asc';
		
		con.query(queue_query, function(err, queuerows) {
			res.render('travellerindex', {itemrows: queuerows, user_id: user.id, title: 'Cut My Queue'});
		});
	});

	app.get('/linetraveller/:id/bid/:bidding_for_id', function (request, response) {
	  var valid = request.query.valid
	  if (valid == "true") {
	  	message = "Successfully Bidded."
	  } else {
	  	message = ""
	  }
	  var params = request.params;
	  var bidder = params.id;
	  var bidding_for = params.bidding_for_id;
	  var sql_query = "SELECT * FROM bid where bidding_for = " + bidding_for + " ORDER BY bid_price DESC";
	  con.query(sql_query, function(err, rows) {
	    var highest_bid = 0; //initialize highest bid to 0
	    //because rows[0] == undefined when no bid was placed
	    if (rows[0]!==undefined){
	      var highest_bid = rows[0].bid_price;
	      console.log("highest_bid is " + highest_bid);
	    }
	    gateway.clientToken.generate({}, function (err, res) {
	      response.render('index2', {
	        clientToken: res.clientToken,
	        highest_bid: highest_bid,
	        bidder:bidder,
	        bidding_for:bidding_for,
	        message: message
	      });
	    });
	  });
	});

	app.post('/placebid/:id/bid/:bidding_for_id', urlencodedParser, function (request, response){
	  var params = request.params;
	  var bidder = params.id;
	  var bidding_for = params.bidding_for_id;
	  var bid_price = request.body.amount;

	  var sql_query = "INSERT INTO bid (bidding_for, bidder, bid_price) VALUES(" + bidding_for + ", "+ bidder + ", " + bid_price +")";
	  con.query(sql_query, function(err, rows){
	  	gateway.customer.create({
		  firstName: "JJJ",
		  lastName: "Smith",
		}, function (err, result) {
		  result.success;
		  // true

		  result.customer.id;
		  // e.g. 494019
		});
	    console.log(rows);
	    // response.sendFile('bidsuccess.html',{
	    //   root: './public'
	    // }
	    response.redirect('/linetraveller/'+bidder+'/bid/'+bidding_for+'/?valid=true');
	  });

	});

	app.post('/process/:bidding_for_id', urlencodedParser, function (request, response) {

	  var bidding_for = request.params.bidding_for_id;
	  var highest_bid = 0; //initialize

	  var sql_query = "SELECT * FROM bid where bidding_for = " + bidding_for + " ORDER BY bid_price DESC";
	  con.query(sql_query, function(err, rows) {
	    //because rows[0] == undefined when no bid was placed
	    if (rows[0]!==undefined){
	      var highest_bid = rows[0].bid_price;
	      // console.log("highest_bid is " + highest_bid);
	    }
	   });
	  var transaction = request.body;

	  gateway.transaction.sale({
	    amount: highest_bid,
	    paymentMethodNonce: transaction.payment_method_nonce
	  }, function (err, result) {

	    if (err) throw err;

	    if (result.success) {

	      console.log(result);

	      response.sendFile('success.html', {
	        root: './public'
	      });
	    } else {
	      response.sendFile('error.html', {
	        root: './public'
	      });
	    }
	  });

	});

};





