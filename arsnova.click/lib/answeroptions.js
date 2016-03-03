AnswerOptions = new Mongo.Collection("answeroptions");

AnswerOptions.attachSchema(new SimpleSchema({
	hashtag: {
		type: String,
		min: 1,
		max: 25,
	},
	answerText: {
		type: String,
		min: 1,
		max: 50,
	},
	answerNumber: {
		type: Number,
		min: 0,
	},
	isCorrect: {
		type: Number,
		min: 0,
		max: 1,
	},
}));
