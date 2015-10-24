var DB = require('../controllers/db-controller').DB;

var Like = DB.Model.extend({
   tableName: 'Like',
   idAttribute: 'id',
});

module.exports = {
   Like: Like
};