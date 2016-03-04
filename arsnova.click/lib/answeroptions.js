AnswerOptions = new Mongo.Collection("answeroptions");

AnswerOptions.attachSchema(new SimpleSchema({
	hashtag: {
		type: String,
		min: 1,
		max: 25
	},
	answerText: {
		type: String,
		min: 0,
		max: 500,
		optional: true
	},
	answerOptionNumber: {
		type: Number,
		min: 0
	},
	isCorrect: {
		type: Number,
		min: 0,
		max: 1
	}
}));
