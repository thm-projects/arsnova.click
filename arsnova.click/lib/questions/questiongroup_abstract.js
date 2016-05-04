import {AbstractQuestion} from './question_abstract.js';
import {SingleChoiceQuestion} from "/lib/questions/question_choice_single.js";
import {MultipleChoiceQuestion} from "/lib/questions/question_choice_multiple.js";
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
						case "SingleChoiceQuestion":
							options.questionList[i] = new SingleChoiceQuestion(options.questionList[i]);
							break;
						case "MultipleChoiceQuestion":
							options.questionList[i] = new MultipleChoiceQuestion(options.questionList[i]);
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

	serialize() {
		let questionListSerialized = [];
		this[questionList].forEach(function (question) { questionListSerialized.push(question.serialize()); });
		return {
			hashtag: this[hashtag],
			type: this.constructor.name,
			questionList: questionListSerialized
		};
	}
}
