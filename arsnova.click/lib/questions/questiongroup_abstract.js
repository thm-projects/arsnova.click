import {AbstractQuestion} from './question_abstract.js';

const hashtag = Symbol("hashtag");
const questionList = Symbol("questionList");

export class AbstractQuestionGroup {

	constructor (options) {
		if (this.constructor === AbstractQuestionGroup) {
			throw new TypeError("Cannot construct Abstract instances directly");
		}
		if (!options.hashtag) {
			throw new Error("Invalid argument list for QuestionGroup instantiation");
		}
		if (!options.questionList || !(options.questionList instanceof Array)) {
			this[questionList] = [];
		} else {
			for (let i = 0; i < options.questionList.length; i++) {
				if (!(options.questionList[i] instanceof AbstractQuestion)) {
					throw new Error("Invalid argument list for QuestionGroup instantiation");
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

	removeQuestionByIndex (index) {
		if (!index || index < 0 || index > this[questionList].length) {
			throw new Error("Invalid argument list for QuestionGroup.removeQuestionByIndex");
		}
		this[questionList].splice(index, 1);
	}

	getHashtag () {
		return this[hashtag];
	}

	getQuestionList () {
		return this[questionList];
	}
}
