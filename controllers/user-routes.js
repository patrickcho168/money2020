// vendor library
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');

// custom library
// model
var Model = require('../models/user-model');

// sign in
// GET
var signIn = function(req, res, next) {
   if(req.isAuthenticated()) res.redirect('/');
   res.render('signin', {title: 'Sign In to Freemie!'});
};

// sign in
// POST
var signInPost = function(req, res, next) {
   passport.authenticate('local', { successRedirect: '/',
                          failureRedirect: '/signin'}, function(err, user, info) {
      if(err) {
         return res.render('signin', {title: 'Sign In to Freemie!', errorMessage: err.message});
      } 

      if(!user) {
         return res.render('signin', {title: 'Sign In to Freemie!', errorMessage: info.message});
      }
      return req.logIn(user, function(err) {
         if(err) {
            return res.render('signin', {title: 'Sign In to Freemie!', errorMessage: err.message});
         } else {
            return res.redirect('/');
         }
      });
   })(req, res, next);
};

// sign up
// GET
var signUp = function(req, res, next) {
   if(req.isAuthenticated()) {
      res.redirect('/');
   } else {
      res.render('signup', {title: 'Sign Up'});
   }
};

// sign up
// POST
var signUpPost = function(req, res, next) {
   var user = req.body;
   var usernamePromise = null;
   var usernamePromise = new Model.User({username: user.username}).fetch();

   if (user.profilepic.match(/\.(jpeg|jpg|gif|png)$/) == null) {
      res.render('signup', {title: 'signup', errorMessage: 'Profile Pic URL not an image.'});
   }
   else {
      return usernamePromise.then(function(model) {
         if(model) {
            res.render('signup', {title: 'signup', errorMessage: 'username already exists'});
         } else {
            //****************************************************//
            // MORE VALIDATION GOES HERE(E.G. PASSWORD VALIDATION)
            //****************************************************//
            var password = user.password;
            var hash = bcrypt.hashSync(password);
            console.log(hash);

            var signUpUser = new Model.User({username: user.username, password: hash, first_name: user.firstname, last_name: user.lastname, profile_pic: user.profilepic, email: user.email});

            signUpUser.save().then(function(model) {
               // sign in the newly registered user
               signInPost(req, res, next);
            });	
         };
      });
   };
};

// sign out
var signOut = function(req, res, next) {
   if(!req.isAuthenticated()) {
      notFound404(req, res, next);
   } else {
      req.logout();
      res.redirect('/signin');
   }
};

// 404 not found
var notFound404 = function(req, res, next) {
   res.status(404);
   res.render('404', {title: '404 Not Found'});
};

// export functions
/**************************************/
// index

// sigin in
// GET
module.exports.signIn = signIn;
// POST
module.exports.signInPost = signInPost;

// sign up
// GET
module.exports.signUp = signUp;
// POST
module.exports.signUpPost = signUpPost;

// sign out
module.exports.signOut = signOut;

// 404 not found
module.exports.notFound404 = notFound404;