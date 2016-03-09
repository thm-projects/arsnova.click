Sessions = new Mongo.Collection("sessions");

Sessions.attachSchema(new SimpleSchema({
	hashtag: {
		type: String,
		min: 1,
		max: 25
	},
	questionText: {
		type: String,
		min: 5,
		max: 1000
	},
	timer: {
		type: Number,
		min: 0
	},
	isReadingConfirmationRequired: {
		type: Number,
		min: 0,
		max: 1
	},
	startTime: {
		type: String,
		optional: true
	}
}));
