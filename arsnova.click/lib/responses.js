Responses = new Mongo.Collection("responses");

Responses.attachSchema(new SimpleSchema({
	hashtag: {
		type: String,
		min: 1,
		max: 25
	},
	userNick: {
		type: String,
		min: 1,
		max: 25
	},
	answerOptionNumber: {
		type: Number,
		min: 0
	},
	responseTime: {
		type: Number,
		min: 0
	}
}));
