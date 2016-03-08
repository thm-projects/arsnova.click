Hashtags = new Mongo.Collection("hashtags");

Hashtags.attachSchema(new SimpleSchema({
	hashtag: {
		type: String,
		min: 1,
		max: 25
	},
	privateKey: {
		type: String,
		min: 12,
		max: 12
	},
	isActive: {
		type: Number,
		min: 0,
		max: 1
	},
	lastConnection:{
		type: Number
	}
}));
