import {AnswerOptionCollection} from '../answeroptions/collection.js';
import {AbstractAnswerOption} from '../answeroptions/answeroption_abstract.js';

const questionText = Symbol("questionText");
const timer = Symbol("timer");
const startTime = Symbol("startTime");
const questionIndex = Symbol("questionIndex");
const answerOptionList = Symbol("answerOptionList");

export class AbstractQuestion {
	constructor (options) {
		if (this.constructor === AbstractQuestion) {
			throw new TypeError("Cannot construct Abstract instances directly");
		}
		if (!options.questionText || !options.timer || !options.startTime || !options.questionIndex) {
			throw new Error("Invalid argument list for Question instantiation");
		}
		this[questionText] = options.questionText;
		this[timer] = options.timer;
		this[startTime] = options.startTime;
		this[questionIndex] = options.questionIndex;
		this[answerOptionList] = AnswerOptionCollection.find({
			hashtag: options.hashtag,
			questionIndex: options.questionIndex
		}).fetch();
	}

	setQuestionText (text) {
		if (!(text instanceof String) || text.length < 5 || text.length > 10000) {
			throw new Error("Invalid argument for Question.setText");
		}
		this[questionText] = text;
	}

	getQuestionText () {
		return this[questionText];
	}

	getQuestionIndex () {
		return this[questionIndex];
	}

	setTimer (time) {
		if (!time) {
			throw new Error("Invalid argument for Question.setTimer");
		}
		this[timer] = time;
	}

	getTimer () {
		return this[timer];
	}

	setStartTime (time) {
		if (!time || new Date(time) <= new Date()) {
			throw new Error("Invalid argument for Question.setStartTime");
		}
		this[startTime] = time;
	}

	getStartTime () {
		return this[startTime];
	}

	addAnswerOption (answerOption) {
		if (!answerOption || !(answerOption instanceof AbstractAnswerOption)) {
			throw new Error("Invalid argument for Question.removeAnswerOption");
		}
		this[answerOptionList].push(answerOption);
	}

	removeAnswerOption (index) {
		if (!index || index < 0 || index > this[answerOptionList].length) {
			throw new Error("Invalid argument for Question.removeAnswerOption");
		}
		this[answerOptionList].splice(index);
	}

	getAnswerOptionList () {
		return this[answerOptionList];
	}
}
