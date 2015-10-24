// WEB SERVER

var express = require('express');
//var flash = require('express-flash');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var htmlController = require('./controllers/html-controller');

var port = process.env.PORT || 3000;



app.use('/assets', express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
// ---- try out ----
// app.use(flash());

app.set('view engine', 'ejs');

// -------- Implementing Passport -------------

app.use(cookieParser());
app.use(bodyParser());

htmlController(app);

// the express app, which allows them to coexist.
app.listen(port);

// Initialize a new socket.io object. It is bound to 
