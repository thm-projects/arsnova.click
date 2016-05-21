import {AbstractQuestion} from './question_abstract.js';
import {questionReflection} from "./question_reflection.js";

const hashtag = Symbol("hashtag");
const questionList = Symbol("questionList");

export class AbstractQuestionGroup {

	constructor (options) {
		if (this.constructor === AbstractQuestionGroup) {
			throw new TypeError("Cannot construct Abstract instances directly");
		}
		if (typeof options.hashtag === "undefined") {
			throw new Error("Invalid argument list for " + this.constructor.name + " instantiation");
		}
		if (typeof options.questionList === "undefined" || !(options.questionList instanceof Array)) {
			this[questionList] = [];
		} else {
			for (let i = 0; i < options.questionList.length; i++) {
				if (!(options.questionList[i] instanceof AbstractQuestion)) {
					if (options.questionList[i] instanceof Object) {
						options.questionList[i] = questionReflection[options.questionList[i].type](options.questionList[i]);
					} else {
						throw new Error("Invalid argument list for " + this.constructor.name + " instantiation");
					}
				}
			}
		}
		this[hashtag] = options.hashtag;
		this[questionList] = options.questionList;
	}

	addQuestion (question) {
		if (question instanceof AbstractQuestion) {
			this[questionList].push(question);
			return question;
		}
	}

	removeQuestion (index) {
		if (!index || index < 0 || index > this[questionList].length) {
			throw new Error("Invalid argument list for QuestionGroup.removeQuestion");
		}
		this[questionList].splice(index, 1);
	}

	getHashtag () {
		return this[hashtag];
	}

	getQuestionList () {
		return this[questionList];
	}

	serialize () {
		let questionListSerialized = [];
		this.getQuestionList().forEach(function (question) { questionListSerialized.push(question.serialize()); });
		return {
			hashtag: this[hashtag],
			type: this.constructor.name,
			questionList: questionListSerialized
		};
	}

	isValid () {
		let questionListValid = false;
		this[questionList].forEach(function (question) {
			if (question.isValid()) {
				questionListValid = true;
			}
		});
		return questionListValid;
	}

	equals (questionGroup) {
		if (questionGroup instanceof AbstractQuestionGroup) {
			if (questionGroup.getQuestionList().length === this[questionList].length) {
				let allQuestionsEqual = false;
				for (let i = 0; i < this[questionList].length; i++) {
					if (this[questionList][i].equals(questionGroup.getQuestionList()[i])) {
						allQuestionsEqual = true;
					}
				}
				if (questionGroup.getHashtag() !== this.getHashtag()) {
					allQuestionsEqual = false;
				}
				return allQuestionsEqual;
			}
		}
		return false;
	}

	static typeName () {
		return this.constructor.name;
	}

	toJSONValue () {
		return this.serialize();
	}
}
