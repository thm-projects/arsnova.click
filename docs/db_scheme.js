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

sessions: {
    _id: {
		type:ObjectId
	},
    hashtag: {
		type:String,
		min:1,
		max:25
	},
    questionText: {
        type:String,
        min: 5,
        max: 1000
    },
    timer: {
        type: Number,
        min: 0
    },
    // Soll eine Lesebestätigung angefordert werden?
    isReadingConfirmationRequired:{
        type: Number,
        min: 0,
        max: 1
    }
}

responses: {
    _id: {
		type:ObjectId
	},
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