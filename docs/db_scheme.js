/*
 * This file is part of ARSnova Click.
 * Copyright (C) 2016 The ARSnova Team
 *
 * ARSnova Click is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Click is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ARSnova Click.  If not, see <http://www.gnu.org/licenses/>.*/

hashtags: {
    _id: {
		type:ObjectId
	},
	hashtag: {
		type:String,
		min: 1,
		max: 25
	},
	privateKey: {
		type:ObjectId,
        min: 12,
        max: 12
	},
    isActive: {
        type. Number,
        min: 0,
        max: 1
    }
}

memberlist: {
    _id: {
		type:ObjectId
	},
    hashtag: {
		type:String,
		min: 1,
		max: 25
	},
    nick: {
        type:String,
        min: 3,
        max: 25 // am minimalen Eingabefeld festlegen
    },
    readConfirmed: {
        type: String,
        min: 0,
        max: 1
    }
}

QuestionGroup: {
    _id: {
		type:ObjectId
	},
	hashtag: {
		type: String,
		min: 1,
		max: 25
	},
	questionList: {
		type: [
			questionText: {
				type: String,
				optional: true
			},
			timer: {
				type: Number,
				min: 0
			},
			startTime: {
				type: String,
				optional: true
			}
		]
	}
});

responses: {
    _id: {
		type:ObjectId
	},
    hashtag: {
		type:String,
		min:1,
		max:25
	},
	questionIndex: {
		type: Number,
			min: 0
	},
	userNick: {
        type:String,
        min:3,
        max:25
    },
    answerOptionNumber: {
        type: Number,
        min: 0
    },
    // response times / countdown-timer are always saved in milliseconds and display in seconds
    responseTime: {
        type: Number,
        min: 0
    }
}

answerOptions: {
    _id: {
		type:ObjectId
	},
    hashtag: {
		type:String,
		min:1,
		max:25
	},
	questionIndex: {
		type: Number,
		min: 0
	},
    answerText: {
        type: String,
        // es wird mit A,B,C & D gearbeitet, es kann der Fall eintreten, dass kein weiterer Antworttext gewünscht wird!
        // jeder einzugebenede Text darf Markdowns enthalten
        min: 0,
        // Sicherheitsmaßnahme: wann wird auf Längen geprüft? (Reaktivität?) bei 0 übrigen Zeichen soll nichts mehr angezeigt werden!
        max: 500
    },
    answerOptionNumber: {
        type: int,
        min: 0
    },
    // Boolean
    isCorrect: {
        type: Number,
        min: 0,
        max: 1
    }
}

leaderboard: {
    _id: {
		type:ObjectId
	},
    hashtag: {
		type:String,
		min:1,
		max:25
	},
	questionIndex: {
		type: Number,
		min: 0
	},
    userNick: {
        type:String,
        min:3,
        max:25
    },
    responseTimeMillis: {
		type: Number,
        min: 0
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
}