Users = new Mongo.Collection("users");

Users.attachSchema(new SimpleSchema({
	hashtag: {
		type: String,
		min: 1,
		max: 25,
	},
	nick: {
		type: String,
		min: 3,
		max: 25,
	},
}));
