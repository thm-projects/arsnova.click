const hashtag = Symbol("hashtag");
const questionIndex = Symbol("questionIndex");
const answerText = Symbol("answerText");
const answerOptionNumber = Symbol("answerOptionNumber");
const isCorrect = Symbol("isCorrect");

export class AbstractAnswerOption {

	constructor (options) {
		if (new.target === AbstractAnswerOption) {
			throw new TypeError("Cannot construct Abstract instances directly");
		}
		if (!options.hashtag || !options.questionIndex || !options.answerText || !options.answerOptionNumber || !options.isCorrect) {
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
}
