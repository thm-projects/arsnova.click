import {AbstractQuestion} from './question_abstract.js';
import {questionReflection} from "./question_reflection.js";
import {SingleChoiceQuestion} from './question_choice_single.js';

const hashtag = Symbol("hashtag");
const questionList = Symbol("questionList");
const theme = Symbol("theme");
const musicVolume = Symbol("musicVolume");
const musicEnabled = Symbol("musicEnabled");
const musicTitle = Symbol("musicTitle");

export class AbstractQuestionGroup {

	/**
	 * Constructor super method for creating a QuestionGroup instance
	 * This method cannot be invoked directly.
	 * @param {{hashtag: String, questionList: Array, theme: String}} options An object containing the hashtag and an optional questionList
	 * @throws {TypeError} If this method is invoked directly
	 * @throws {Error} If the hashtag of the options Object is missing
	 */
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
		this[theme] = options.theme || "theme-dark";
		this[musicVolume] = options.musicVolume || 80;
		this[musicEnabled] = options.musicEnabled || "1";
		this[musicTitle] = options.musicTitle || "Song1";
	}

	/**
	 * Adds a question to the questionGroup instance
	 * @param {SingleChoiceQuestion|MultipleChoiceQuestion|RangedQuestion|SurveyQuestion} question The question which extends {AbstractQuestion} to be added
	 * @param {Number} [index] An optional index position where the item should be added
	 * @returns {AbstractQuestion|Null} if successful returns the inserted Question otherwise Null
	 */
	addQuestion (question, index) {
		if (question instanceof AbstractQuestion) {
			if (typeof index === "undefined" || index >= this.getQuestionList().length) {
				this[questionList].push(question);
			} else {
				this[questionList][index] = question;
			}
			return question;
		}
		return null;
	}

	/**
	 * Removes a question by the specified index
	 * @param {Number} index The index of the question to be removed
	 * @throws {Error} If the index is not passed, smaller than 0 or larger than the length of the questionList
	 */
	removeQuestion (index) {
		if (typeof index === "undefined" || index < 0 || index > this.getQuestionList().length) {
			throw new Error("Invalid argument list for QuestionGroup.removeQuestion");
		}
		this[questionList].splice(index, 1);
		for (let i = index; i < this.getQuestionList().length; i++) {
			this.getQuestionList()[i].setQuestionIndex(i);
		}
	}

	/**
	 * Returns the Hashtag of the questionGroup instance
	 * @returns {String} The hashtag identifying the session
	 */
	getHashtag () {
		return this[hashtag];
	}

	/**
	 * Returns the questionList of the questionGroup instance
	 * @returns {Array} The current list of questions
	 */
	getQuestionList () {
		return this[questionList];
	}

	/**
	 * Serialize the instance object to a JSON compatible object
	 * @returns {{hashtag: String, type: String, questionList: Array}}
	 */
	serialize () {
		let questionListSerialized = [];
		this.getQuestionList().forEach(function (question) { questionListSerialized.push(question.serialize()); });
		return {
			hashtag: this.getHashtag(),
			questionList: questionListSerialized,
			theme: this.getTheme(),
			musicVolume: this.getMusicVolume(),
			musicEnabled: this.getMusicEnabled(),
			musicTitle: this.getMusicTitle()
		};
	}

	/**
	 * Checks if the properties of this instance are valid. Checks also recursively all including Question instances
	 * and summarizes their result of calling .isValid()
	 * @returns {boolean} True, if the complete QuestionGroup instance is valid, False otherwise
	 */
	isValid () {
		let questionListValid = true;
		this.getQuestionList().forEach(function (question) {
			if (questionListValid && !question.isValid()) {
				questionListValid = false;
			}
		});
		return questionListValid;
	}

	/**
	 * Checks for equivalence relations to another questionGroup instance. Also part of the EJSON interface
	 * @see http://docs.meteor.com/api/ejson.html#EJSON-CustomType-equals
	 * @param {AbstractQuestionGroup} questionGroup The questionGroup instance which should be checked
	 * @returns {boolean} True if both instances are completely equal, False otherwise
	 */
	equals (questionGroup) {
		if (questionGroup instanceof AbstractQuestionGroup) {
			if (questionGroup.getHashtag() !== this.getHashtag()) {
				return false;
			}
			if (questionGroup.getTheme() !== this.getTheme()) {
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

	/**
	 * Part of EJSON interface
	 * @see AbstractQuestionGroup.serialize()
	 * @see http://docs.meteor.com/api/ejson.html#EJSON-CustomType-toJSONValue
	 * @returns {{hashtag, type, questionList}|{hashtag: String, type: String, questionList: Array}}
	 */
	toJSONValue () {
		return this.serialize();
	}

	/**
	 * Quick way to insert a default question to the QuestionGroup instance.
	 * @param {Number} [index] The index where the question should be inserted. If not passed, it will be added to the end of the questionList
	 */
	addDefaultQuestion (index) {
		if (typeof index === "undefined" || index >= this.getQuestionList().length) {
			index = this.getQuestionList().length;
		}
		const questionItem = new SingleChoiceQuestion({
			hashtag: this.getHashtag(),
			questionText: "",
			questionIndex: index,
			timer: 0,
			startTime: 0,
			answerOptionList: []
		});
		for (let i = 0; i < 4; i++) {
			questionItem.addDefaultAnswerOption(i);
		}
		this.addQuestion(
			questionItem,
			index
		);
	}

	getTheme () {
		return this[theme];
	}

	setTheme (newTheme) {
		if (typeof newTheme !== "string") {
			throw new Error("Invalid argument list for QuestionGroup.setTheme");
		}
		this[theme] = newTheme;
	}

	getMusicVolume () {
		return this[musicVolume];
	}

	setMusicVolume (newMusicVolume) {
		if (typeof newMusicVolume !== "number") {
			throw new Error("Invalid argument list for QuestionGroup.setMusicVolume");
		}
		this[musicVolume] = newMusicVolume;
	}

	getMusicEnabled () {
		return this[musicEnabled];
	}

	setMusicEnabled (newMusicEnabled) {
		if (typeof newMusicEnabled !== "number") {
			throw new Error("Invalid argument list for QuestionGroup.setMusicEnabled");
		}
		this[musicEnabled] = newMusicEnabled;
	}

	getMusicTitle () {
		return this[musicTitle];
	}

	setMusicTitle (newMusicTitle) {
		if (typeof newMusicTitle !== "string") {
			throw new Error("Invalid argument list for QuestionGroup.setMusicTitle");
		}
		this[musicTitle] = newMusicTitle;
	}
}
