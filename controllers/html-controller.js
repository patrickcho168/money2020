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

con.query('USE freemie');

var siteName = "localhost:3000";

module.exports = function(app) {
	// app.get('/', function(req, res) {
	// 	res.render('index', {issue: ""});
	// });

	// // ------------ FOR LOGIN ----------------
	// app.get('/login', function(req, res) {
	// 	res.render('login', {issue: ""});
	// });

	// app.get('/login/wrongpassword', function(req, res) {
	// 	res.render('login', {issue: "Wrong Password"});
	// });

	// app.get('/login/nousername', function(req, res) {
	// 	res.render('login', {issue: "No Username Found"});
	// });

	// app.post('/login/check', urlencodedParser, function(req, res) {
	// 	var username = req.body.username;
	// 	var password = req.body.password;
	// 	var sql_query = 'select id from Users where username = "' + username + '" and password = "' + password + '"';
	// 	// console.log(sql_query);
	// 	con.query(sql_query, function(err, rows) {
	// 		if (rows.length == 0) {
	// 			var user_query = 'select id from Users where username = "' + username + '"';
	// 			console.log(user_query);
	// 			con.query(user_query, function(err, rows) {
	// 				if (rows.length == 0) {
	// 					console.log('No such user');
	// 					res.redirect("/login/nousername");
	// 				}
	// 				else {
	// 					console.log('Wrong password');
	// 					res.redirect("/login/wrongpassword");
	// 				};
	// 			});
	// 		}
	// 		else {
	// 			var path = '/user/' + rows[0].id;
	// 			console.log(path);
	// 			res.redirect('/user/1');
	// 		};
	// 	});
	// });

	// ------------ FOR USER PROFILE -------------
	app.get('/user/:id', function(req, res) {
		if(!req.isAuthenticated()) {
			res.redirect('/signin');
		} else {
			var other_user = req.params;
			var user = req.user;
			if(user !== undefined) {
				user = user.toJSON();
			}
			var mine = other_user.id == user.id;
			// // MODEL METHOD
			var data = {};
			new allModel.User({id: other_user.id}).fetch().then(function(model1) {
				data.otherUser = model1.toJSON();
				// new allModel.Item().query({where: {giver_id: other_user.id}}).fetchAll({withRelated: ['wantedBy', { 'wantedBy': function (qb) { qb.where({user_id: user.id});}}]}).then( function(model2) {
				new allModel.Item().query({where: {giver_id: other_user.id}}).fetchAll({withRelated: ['wantedBy']}).then( function(model2) {
					var ownedModel = model2.toJSON();
					for (var i = 0; i < ownedModel.length; i++) {
						var wantedBy = ownedModel[i].wantedBy;
						var wantedByUser = false;
						var numberofWants = 0;
						for (var j = 0; j < wantedBy.length; j++) {
							if (wantedBy[j].user_id == user.id) {
								wantedByUser = true;
							};
							numberofWants += 1;
						};
						ownedModel[i].wantedByUser = wantedByUser;
						ownedModel[i].numberofWants = numberofWants;
					};
					data.otherUserItemsOwned = ownedModel;
					new allModel.Want().query({where:{user_id: other_user.id}}).fetchAll({withRelated: ['what']}).then( function(model3) {					
						var wantedModel = model3.toJSON();
						var itemPromises = [];
						for (var k = 0; k < wantedModel.length; k++) {
							var wantedItem = wantedModel[k];
							itemPromises.push(new allModel.Want().query({where:{item_id: wantedItem.item_id}}).fetchAll().then( function(model4) {
								var itemModel = model4.toJSON()
								var count = itemModel.length;
								var wantedByUser = false;
								var ownedByUser = false;
								for (var j = 0; j < count; j++) {
									if (itemModel[j].user_id == user.id) {
										wantedByUser = true;
									}
								};
								return [count, wantedByUser];
							}));
						};
						Promise.all(itemPromises).then(values => {
							for (var i = 0; i < wantedModel.length; i++) {
								wantedModel[i].numberofWants = values[i][0];
								wantedModel[i].wantedByUser = values[i][1];
							};
							data.otherUserItemsWanted = wantedModel;
							res.render('userprofile2', {data: data, mine: mine, user: user});
						});
					});
				});
			});
		};
	});

	// // ------------ FOR SIGN UP ---------------
	// app.get('/signup', function(req, res) {
	// 	res.render('signup', {issue: ""});
	// });

	// // for sign up problems due to same username
	// app.get('/signup/1', function(req, res) {
	// 	res.render('signup', {issue: "Username has been taken. Please try another."});
	// });

	// app.get('/signup/2', function(req, res) {
	// 	res.render('signup', {issue: "Image URL given not an image. Please try another."});
	// });

	// app.post('/signup/check', urlencodedParser, function(req, res) {
	// 	var post = { 
	// 		username: req.body.username,
	// 		password: req.body.password,
	// 		first_name: req.body.firstname,
	// 		last_name: req.body.lastname,
	// 		profile_pic: req.body.profilepic,
	// 		email: req.body.email};
	// 	console.log(post);
	// 	var sql_query = 'select id from Users where username="' + post.username + '"';
	// 	console.log(sql_query);
	// 	con.query(sql_query, function(err, rows) {
	// 		if (rows.length != 0) {
	// 			console.log('Username has been taken');
	// 			res.redirect("/signup/1");
	// 		}
	// 		else if (post.profile_pic.match(/\.(jpeg|jpg|gif|png)$/) == null) {
	// 			console.log("Image URL is not an image");
	// 			res.redirect("/signup/2");
	// 		}
	// 		else {
	// 			var write_query = 'INSERT INTO Users SET ?';
	// 			con.query(write_query, post, function(err, rows) {
	// 				if (err) throw err;
	// 				var user_id = rows.insertId;
	// 				console.log(user_id);
	// 				var path = '/user/' + user_id;
	// 				res.redirect(path);
	// 			});	
	// 		};
	// 	});
	// });

	// ------------ FOR POSTING ITEMS --------------

	app.get('/postitem', function(req, res) {
		if(!req.isAuthenticated()) {
			res.redirect('/signin');
		} else {
			var user = req.user;
			if(user !== undefined) {
				user = user.toJSON();
			}
			res.render('postitem2', {user: user});
		};
	});

	app.post('/postitem/check', function(req, res) {
		var item = req.body;
		if (item.itempic.match(/\.(jpeg|jpg|gif|png)$/) == null) {
			res.redirect('/postitem', {errorMessage: 'Photo URL is not an image.'});
		} else {
			user_id = req.user.id;
			date = moment.utc().format("YYYY-MM-DD HH:mm:ss");
			var postItem = new allModel.Item({time_posted: date, title: item.itemname, giver_id: user_id, description: item.itemdesc, photo: item.itempic});
			postItem.save();
			res.redirect('/user/' + user_id)

		};
	});

	// ------------ FOR BROWSING ITEMS ---------------

	// index page
	app.get('/', function(req, res, next) {
		// if not signed in, direct to signin page.
		if(!req.isAuthenticated()) {
			res.redirect('/signin');
		} else {
			// get user account of signed in user.
			var user = req.user;

			if(user !== undefined) {
				user = user.toJSON();
			}

			var user_id = user.id;
			var item_query = "SELECT p4.total_wants, p3.item_id as wanted_id, p2.username as username, p1.id as item_id, p2.id as user_id, p1.title as title, p1.time_posted as time_posted, p1.giver_id as giver_id, p1.description as description, p1.photo as photo FROM item as p1 LEFT JOIN user as p2 on p2.id = p1.giver_id LEFT JOIN (SELECT * FROM want where user_id = " + user_id + ") as p3 on p3.item_id = p1.id LEFT JOIN (SELECT COUNT(*) as total_wants, item_id FROM want GROUP BY item_id) as p4 on p4.item_id = p1.id where p1.giver_id != " + user_id + " and p1.taker_id is NULL ORDER BY p1.id desc";

			con.query(item_query, function(err, itemrows) {
				console.log(itemrows)
				res.render('index2', {itemrows: itemrows, title: 'Home', user: user});
			});
		};
	});

	// item page
	app.get('/item/:id', function(req, res) {
		if(!req.isAuthenticated()) {
			res.redirect('/signin');
		} else {
			var item_id = req.params.id;
			var user = req.user;
			if(user !== undefined) {
				user = user.toJSON();
			}
			var item_query = "SELECT p2.username as username, p2.id as user_id, p1.id as item_id, p1.title as title, p1.time_posted as time_posted, p1.giver_id as giver_id, p1.description as description, p1.photo as photo FROM item as p1 LEFT JOIN user as p2 on p2.id = p1.giver_id where p1.id = " + item_id;
			con.query(item_query, function(err, itemrows) {

				res.render('itemprofile', {user: user, itemrows: itemrows});
			});
		};
	});

	// post want item
	app.post('/item/:id/dowant/:toid', function(req, res, next) {
		if(!req.isAuthenticated()) {
			res.redirect('/signin');
		} else {
			var item_id = req.params.id;
			var user = req.user;
			item = new allModel.Item({giver_id: user.id, id: item_id}).fetch();
			return item.then(function(myItemModel) {
				if (myItemModel) {
					res.redirect('/')
				}
				else {
					if(user !== undefined) {
						user = user.toJSON();
					}
					wantPromise = new allModel.Want({user_id: user.id, item_id: item_id}).fetch();
					return wantPromise.then(function(model) {
						if (model) {
							res.redirect('/');
						} else {
							var postWant = new allModel.Want({item_id: item_id, user_id: user.id});
							postWant.save();
							var toid = req.params.toid;
							if (toid == 0) {
								res.redirect('/');
							} else {
								res.redirect('/user/' + toid);
							};
						};
					});
				};
			});
		};
	});

	// post unwant item
	app.post('/item/:id/dounwant/:toid', function(req, res, next) {
		if(!req.isAuthenticated()) {
			res.redirect('/signin');
		} else {
			var item_id = req.params.id;
			var user = req.user;
			if(user !== undefined) {
				user = user.toJSON();
			}
			wantPromise = new allModel.Want({user_id: user.id, item_id: item_id}).fetch();
			return wantPromise.then(function(model) {
				if (model) {
					model.destroy();
				};
				var toid = req.params.toid;
				if (toid == 0) {
					res.redirect('/');
				} else {
					res.redirect('/user/' + toid);
				};
			});
		};
	});

};