Hashtags = new Mongo.Collection("hashtags");

Hashtags.attachSchema(new SimpleSchema({
	hashtag: {
		type: String,
		min: 1,
		max: 25
	},
	privateKey: {
		type: String,
		min: 24,
		max: 24
	},
	sessionStatus: {
		type: Number,
		min: 0,
		max: 3
	},
	lastConnection: {
		type: Number
	}
}));
