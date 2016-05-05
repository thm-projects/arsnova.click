import {AnswerOptionCollection} from '../answeroptions/collection.js';
import {AbstractAnswerOption} from '../answeroptions/answeroption_abstract.js';
import {DefaultAnswerOption} from '../answeroptions/answeroption_default.js';

const hashtag = Symbol("questionText");
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
		if (typeof options.type !== "undefined" && options.type !== this.constructor.name) {
			throw new TypeError("Invalid construction type");
		}
		if (typeof options.hashtag === "undefined" || typeof options.questionText === "undefined" || typeof options.timer === "undefined" || typeof options.startTime === "undefined" || typeof options.questionIndex === "undefined") {
			throw new Error("Invalid argument list for " + this.constructor.name + " instantiation");
		}
		this[hashtag] = options.hashtag;
		this[questionText] = options.questionText;
		this[timer] = options.timer;
		this[startTime] = options.startTime;
		this[questionIndex] = options.questionIndex;
		this[answerOptionList] = options.answerOptionList || [];
		if (this[answerOptionList].length === 0) {
			let self = this;
			AnswerOptionCollection.find({
				hashtag: options.hashtag,
				questionIndex: options.questionIndex
			}).fetch().forEach(function (answerOption) {
				self[answerOptionList].push(new DefaultAnswerOption(answerOption));
			});
		} else {
			for (let i = 0; i < this[answerOptionList].length; i++) {
				if (this[answerOptionList][i] instanceof Object) {
					switch (this[answerOptionList][i].type) {
						case "DefaultAnswerOption":
							this[answerOptionList][i] = new DefaultAnswerOption(this[answerOptionList][i]);
							break;
					}
				}
				if (!(this[answerOptionList][i] instanceof AbstractAnswerOption)) {
					throw new Error("Invalid argument list for " + this.constructor.name + " instantiation");
				}
			}
		}
	}

	getHashtag () {
		return this[hashtag];
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

	removeAllAnswerOptions () {
		this[answerOptionList] = [];
	}

	getAnswerOptionList () {
		return this[answerOptionList];
	}

	serialize() {
		let answerOptionListSerialized = [];
		this[answerOptionList].forEach(function (answeroption) { answerOptionListSerialized.push(answeroption.serialize()); });
		return {
			hashtag: this[hashtag],
			questionText: this[questionText],
			type: this.constructor.name,
			timer: this[timer],
			startTime: this[startTime],
			questionIndex: this[questionIndex],
			answerOptionList: answerOptionListSerialized
		};
	}

	isValid() {
		return true;
	}

	equals (question) {
		if (question instanceof AbstractQuestion) {
			let questionAnswerOptionList = question.getAnswerOptionList();
			if (questionAnswerOptionList.length === this[answerOptionList].length) {
				let isEqual = false;
				for (let i = 0; i < this[answerOptionList].length; i++) {
					if (this[answerOptionList][i].equals(questionAnswerOptionList[i])) {
						isEqual = true;
					}
				}
				if (question.getTimer() !== this[timer] ||
					question.getStartTime() !== this[startTime] && question.getHashtag() === this[hashtag] ||
					question.getQuestionText() !== this[questionText]) {
					isEqual = false;
				}
				return isEqual;
			}
		}
		return false;
	}
}
