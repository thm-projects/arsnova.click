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
		if (typeof text !== "string") {
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

	setIsCorrect (value) {
		if (typeof value !== "boolean") {
			throw new Error("Invalid argument for AnswerOption.setIsCorrect");
		}
		this[isCorrect] = value;
	}

	serialize () {
		return {
			hashtag: this.getHashtag(),
			type: this.constructor.name,
			questionIndex: this.getQuestionIndex(),
			answerText: this.getAnswerText(),
			answerOptionNumber: this.getAnswerOptionNumber(),
			isCorrect: this.getIsCorrect()
		};
	}

	isValid () {
		return this.getAnswerText().length > 0;
	}

	equals (answerOption) {
		return answerOption instanceof AbstractAnswerOption &&
			answerOption.getQuestionIndex() === this.getQuestionIndex() &&
			answerOption.getAnswerText() === this.getAnswerText() &&
			answerOption.getAnswerOptionNumber() === this.getAnswerOptionNumber() &&
			answerOption.getIsCorrect() === this.getIsCorrect();
	}

	typeName () {
		return this.constructor.name;
	}

	toJSONValue () {
		return {
			hashtag: this.getHashtag(),
			questionIndex: this.getQuestionIndex(),
			answerText: this.getAnswerText(),
			answerOptionNumber: this.getAnswerOptionNumber(),
			isCorrect: this.getIsCorrect()
		};
	}
}
