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
		this[questionList] = [];
		if (options.questionList instanceof Array) {
			for (let i = 0; i < options.questionList.length; i++) {
				console.log(options.questionList[i]);
				if (!(options.questionList[i] instanceof AbstractQuestion)) {
					if (options.questionList[i] instanceof Object) {
						options.questionList[i] = questionReflection[options.questionList[i].type](options.questionList[i]);
					} else {
						throw new Error("Invalid argument list for " + this.constructor.name + " instantiation");
					}
				}
				this[questionList].push(options.questionList[i]);
			}
		}
		this[hashtag] = options.hashtag;
	}

	addQuestion (question) {
		if (question instanceof AbstractQuestion) {
			this[questionList].push(question);
			return question;
		}
	}

	removeQuestion (index) {
		if (!index || index < 0 || index > this.getQuestionList().length) {
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
			hashtag: this.getHashtag(),
			type: this.constructor.name,
			questionList: questionListSerialized
		};
	}

	isValid () {
		let questionListValid = false;
		this.getQuestionList().forEach(function (question) {
			if (question.isValid()) {
				questionListValid = true;
			}
		});
		return questionListValid;
	}

	equals (questionGroup) {
		if (questionGroup instanceof AbstractQuestionGroup) {
			if (questionGroup.getHashtag() !== this.getHashtag()) {
				return false;
			}
			if (questionGroup.getQuestionList().length === this.getQuestionList().length) {
				let allQuestionsEqual = false;
				for (let i = 0; i < this.getQuestionList().length; i++) {
					if (this.getQuestionList()[i].equals(questionGroup.getQuestionList()[i])) {
						allQuestionsEqual = true;
					}
				}
				return allQuestionsEqual;
			}
		}
		return false;
	}

	typeName () {
		return this.constructor.name;
	}

	toJSONValue () {
		return this.serialize();
	}
}
