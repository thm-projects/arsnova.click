import {AbstractQuestion} from './question_abstract.js';
import {ChoicableQuestion} from "/lib/questions/question_choiceable.js";
import {RangedQuestion} from "/lib/questions/question_ranged.js";
import {SurveyQuestion} from "/lib/questions/question_survey.js";

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
				if (options.questionList[i] instanceof Object) {
					switch (options.questionList[i].type) {
						case "ChoicableQuestion":
							options.questionList[i] = new ChoicableQuestion(options.questionList[i]);
							break;
						case "SurveyQuestion":
							options.questionList[i] = new SurveyQuestion(options.questionList[i]);
							break;
						case "RangedQuestion":
							options.questionList[i] = new RangedQuestion(options.questionList[i]);
							break;
					}
				}
				if (!(options.questionList[i] instanceof AbstractQuestion)) {
					throw new Error("Invalid argument list for " + this.constructor.name + " instantiation");
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
		this[questionList].forEach(function (question) { questionListSerialized.push(question.serialize()); });
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
}
