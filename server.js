'use strict';

var express = require('express');
var app = express();
var mysql = require('mysql');

var braintree = require('braintree');

var bodyParser = require('body-parser');
var parseUrlEnconded = bodyParser.urlencoded({
  extended: false
});

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "freemie"
})

con.connect(function(err) {
  if(!err) {
    console.log("Database is connected ... \n\n");
  } else {
    console.log("Error connecting database ... \n\n")
  };
})

con.query("USE cutqueue")

var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: '2677fhnwncmtzpdp',
  publicKey: '24ck88nkh4ytcdqt',
  privateKey: '9bddeff3ea84b7a89144e7a60d11c80f'
});

app.use(express.static('public'));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.get('/', function (request, response) {
  var sql_query = "SELECT * FROM bid ORDER BY bid_price DESC";
  con.query(sql_query, function(err, rows) {
    var highest_bid = 0; //initialize highest bid to 0
    //because rows[0] == undefined when no bid was placed
    if (rows[0]!==undefined){
      var highest_bid = rows[0].bid_price;
    }
    gateway.clientToken.generate({}, function (err, res) {
      response.render('index2', {
        clientToken: res.clientToken,
        highest_bid: highest_bid
      });
    });
  });
});

app.post('/placebid', parseUrlEnconded, function (request, response){

  var bidding = request.body;
  console.log(bidding);
  var bid_price = bidding.amount;

  var sql_query = "INSERT INTO bid (bidding_for, bidder, bid_price) VALUES(2, 10, " + bid_price +")";
  con.query(sql_query, function(err, rows){
    console.log(rows);
    response.sendFile('bidsuccess.html',{
      root: './public'
    });
  });

});

app.post('/process', parseUrlEnconded, function (request, response) {

  var transaction = request.body;

  gateway.transaction.sale({
    amount: transaction.amount,
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

app.listen(4000, function () {
  console.log('Listening on port 4000');
});

module.exports = app;