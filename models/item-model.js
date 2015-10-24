var DB = require('../controllers/db-controller').DB;

var Item = DB.Model.extend({
   tableName: 'Item',
   idAttribute: 'id',

});

var User = DB.Model.extend({
   tableName: 'User',
   idAttribute: 'id',
});

var Like = DB.Model.extend({
   tableName: 'Like',
   idAttribute: 'id',
});

module.exports = {
   Item: Item,
   User: User,
   Like: Like
};