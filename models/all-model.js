var DB = require('../controllers/db-controller').DB;

var User = DB.Model.extend({
	tableName: 'user',
	idAttribute: 'id',
	owns: function() {
		return this.hasMany(Item, Item.giver_id);
	},
	takes: function() {
		return this.hasMany(Item, Item.taker_id);
	},
	wants: function() {
		return this.hasMany(Want, Want.user_id);
	},
	startsConv: function() {
		return this.hasMany(Conv, Conv.user1_id);
	},
	acceptsConv: function() {
		return this.hasMany(Conv, Conv.user2_id);
	},
	writesLine: function() {
		return this.hasMany(Line, Line.user_id);
	}
});

var Conv = DB.Model.extend({
	tableName: 'conv',
	idAttribute: 'id',
	user1_id: 'user1_id',
	user2_id: 'user2_id',
	startedBy: function() {
		return this.belongsTo(User, Conv.user1_id);
	},
	acceptedBy: function() {
		return this.belongsTo(User, Conv.user2_id);
	},
	contains: function() {
		return this.hasMany(Line, Line.conv_id);
	}
});

var Line = DB.Model.extend({
	tableName: 'line',
	idAttribute: 'id',
	conv_id: 'conv_id',
	user_id: 'user_id',
	writtenBy: function() {
		return this.belongsTo(User, Line.user_id);
	},
	containedBy: function() {
		return this.belongsTo(Conv, Line.conv_id);
	},
});

var Item = DB.Model.extend({
	tableName: 'item',
	idAttribute: 'id',
	giver_id: 'giver_id',
	taker_id: 'taker_id',
	belongsTo: function() {
		return this.belongsTo(User, Item.giver_id);
	},
	givenTo: function() {
		return this.belongsTo(User, Item.taker_id);
	},
	wantedBy: function() {
		return this.hasMany(Want, Want.item_id);
	}
});

var Want = DB.Model.extend({
	tableName: 'want',
	idAttribute: 'id',
	item_id: 'item_id',
	user_id: 'user_id',
	by: function() {
		return this.belongsTo(User, Want.user_id);
	},
	what: function() {
		return this.belongsTo(Item, Want.item_id);
	}
});

module.exports = {
	Item: Item,
	User: User,
	Want: Want,
	Conv: Conv,
	Line: Line
};