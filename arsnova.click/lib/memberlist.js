MemberList = new Mongo.Collection("memberlist");

MemberList.attachSchema(new SimpleSchema({
	hashtag: {
		type: String,
		min: 1,
		max: 25
	},
	nick: {
		type: String,
		min: 3,
		max: 25
	},
	readConfirmed: {
		type: Number,
		min: 0,
		max: 1
	},

}));
