Hashtags = new Mongo.Collection("leaderBoard");

Hashtags.attachSchema(new SimpleSchema({
	hashtag: {
		type:String,
		min:1,
		max:25
	},
	userNick: {
		type:String,
		min:3,
		max:25
	},
	givenAnswers: {
		type: Number,
		min: 1,
		max: 26
	},
	rightAnswers: {
		type: Number,
		min: 0,
		max: 26
	},
	wrongAnswers: {
		type: Number,
		min: 0,
		max: 26
	}
}));
