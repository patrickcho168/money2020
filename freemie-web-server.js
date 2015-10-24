// WEB SERVER

var express = require('express');
//var flash = require('express-flash');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var htmlController = require('./controllers/html-controller');
var apiController = require('./controllers/api-controller');
var passport = require('./controllers/user-controller');
var route = require('./controllers/user-routes');

var port = process.env.PORT || 3000;



app.use('/assets', express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
// ---- try out ----
// app.use(flash());

app.set('view engine', 'ejs');

// -------- Implementing Passport -------------

app.use(cookieParser());
app.use(bodyParser());
app.use(session({secret: 'secret strategic xxzzz code'}));
app.use(passport.initialize());
app.use(passport.session());

// signin
// GET
app.get('/signin', route.signIn);
// POST
app.post('/signin', route.signInPost);

// signup
// GET
app.get('/signup', route.signUp);
// POST
app.post('/signup', route.signUpPost);

// logout
// GET
app.get('/signout', route.signOut);

apiController(app);
htmlController(app);

// the express app, which allows them to coexist.
var io = require('socket.io').listen(app.listen(port));

// Require the configuration and the routes files, and pass
// the app and io as arguments to the returned functions.
require('./controllers/chat-controller')(app, io);

/********************************/

/********************************/
// 404 not found
app.use(route.notFound404);

// Initialize a new socket.io object. It is bound to 
