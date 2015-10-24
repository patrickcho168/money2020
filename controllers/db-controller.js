var credentials = require('../credentials')

var knex = require('knex')({
  client: 'mysql',
  connection: {
   host: 'localhost',  // your host
   user: credentials.dbusr, // your database user
   password: credentials.dbpwd, // your database password
   database: 'freemie',
   charset: 'utf8'
	}
});

var Bookshelf = require('bookshelf')(knex);

module.exports.DB = Bookshelf;