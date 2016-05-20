const hashtag = Symbol("hashtag");
const questionIndex = Symbol("questionIndex");
const answerText = Symbol("answerText");
const answerOptionNumber = Symbol("answerOptionNumber");
const isCorrect = Symbol("isCorrect");

export class AbstractAnswerOption {

	constructor (options) {
		if (this.constructor === AbstractAnswerOption) {
			throw new TypeError("Cannot construct Abstract instances directly");
		}
		if (typeof options.type !== "undefined" && options.type !== this.constructor.name) {
			throw new TypeError("Invalid construction type");
		}
		if (typeof options.hashtag === "undefined" || typeof options.questionIndex === "undefined" || typeof options.answerText === "undefined" || typeof options.answerOptionNumber === "undefined" || typeof options.isCorrect === "undefined") {
			throw new Error("Invalid argument list for AnswerOption instantiation");
		}
		this[hashtag] = options.hashtag;
		this[questionIndex] = options.questionIndex;
		this[answerText] = options.answerText;
		this[answerOptionNumber] = options.answerOptionNumber;
		this[isCorrect] = options.isCorrect;
	}

	getHashtag () {
		return this[hashtag];
	}

	getQuestionIndex () {
		return this[questionIndex];
	}

	getAnswerText () {
		return this[answerText];
	}

	setAnswerText (text) {
		if (!text || !(text instanceof String)) {
			throw new Error("Invalid argument for AnswerOption.setAnswerText");
		}
		this[answerText] = text;
	}

	getAnswerOptionNumber () {
		return this[answerOptionNumber];
	}

	getIsCorrect () {
		return this[isCorrect];
	}

	setIsCorrect (isCorrect) {
		if (!isCorrect || !(isCorrect instanceof Boolean)) {
			throw new Error("Invalid argument for AnswerOption.setIsCorrect");
		}
		this[isCorrect] = isCorrect;
	}

	serialize () {
		return {
			hashtag: this[hashtag],
			type: this.constructor.name,
			questionIndex: this[questionIndex],
			answerText: this[answerText],
			answerOptionNumber: this[answerOptionNumber],
			isCorrect: this[isCorrect]
		};
	}

	isValid () {
		return true;
	}

	equals (answerOption) {
		return answerOption instanceof AbstractAnswerOption &&
			answerOption.getQuestionIndex() === this[questionIndex] &&
			answerOption.getAnswerText() === this[answerText] &&
			answerOption.getAnswerOptionNumber() === this[answerOptionNumber] &&
			answerOption.getIsCorrect() === this[isCorrect];
	}

	typeName () {
		return this.constructor.name;
	}

	toJSONValue () {
		return this.serialize();
	}
}
