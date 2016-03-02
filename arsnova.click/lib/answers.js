Answers = new Mongo.Collection("answers");

Answers.attachSchema(new SimpleSchema({
	hashtag: {
		type: String,
		min: 1,
		max: 25,
	},
	userNick: {
		type: String,
		min: 1,
		max: 25,
	},
	optionNumber: {
		type: Number,
		min: 0,
	},
	responseTime: {
		type: Number,
		min: 0,
	},
}));
