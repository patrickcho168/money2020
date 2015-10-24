var DB = require('../controllers/db-controller').DB;

var User = DB.Model.extend({
   tableName: 'User',
   idAttribute: 'id',
});

module.exports = {
   User: User
};