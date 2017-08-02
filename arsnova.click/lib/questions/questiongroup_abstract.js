/*
 * This file is part of ARSnova Click.
 * Copyright (C) 2016 The ARSnova Team
 *
 * ARSnova Click is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Click is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ARSnova Click.  If not, see <http://www.gnu.org/licenses/>.*/

import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {hashtagSchema} from '/lib/hashtags/collection.js';
import {AbstractQuestion} from './question_abstract.js';
import {questionReflection} from "./question_reflection.js";
import {SessionConfiguration} from '../session_configuration/session_config.js';

const hashtag = Symbol("hashtag");
const isFirstStart = Symbol("isFirstStart");
const questionList = Symbol("questionList");
const sessionConfig = Symbol("sessionConfig");

export class AbstractQuestionGroup {

	/**
	 * Constructor super method for creating a QuestionGroup instance
	 * This method cannot be invoked directly.
	 * @param {{hashtag: String, questionList: Array, theme: String, isClient: Boolean}} options An object containing the hashtag, a theme name to use for the quiz, a switch if the current user is an attendee of the quiz and an optional questionList
	 * @throws {TypeError} If this method is invoked directly
	 * @throws {Error} If the hashtag of the options Object is missing
	 */
	constructor(options) {
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
				if (options.isClient) {
					if (options.questionList[i].typeName() === "RangedQuestion") {
						options.questionList[i].setRange(-1, 0);
						options.questionList[i].setCorrectValue(0);
					} else if (options.questionList[i].typeName() === "FreeTextQuestion") {
						options.questionList[i].getAnswerOptionList()[0].setAnswerText("");
					} else {
						options.questionList[i].getAnswerOptionList().forEach(function (elem) {
							elem.setIsCorrect(false);
						});
					}
				}
				this[questionList].push(options.questionList[i]);
			}
		}
		this[hashtag] = options.hashtag;
		this[isFirstStart] = typeof options.isFirstStart === "undefined" ? true : options.isFirstStart;
		this[sessionConfig] = new SessionConfiguration(options.configuration || {hashtag: options.hashtag});
	}

	/**
	 * Adds a question to the questionGroup instance
	 * @param {SingleChoiceQuestion|MultipleChoiceQuestion|RangedQuestion|SurveyQuestion} question The question which extends {AbstractQuestion} to be added
	 * @param {Number} [index] An optional index position where the item should be added
	 * @returns {AbstractQuestion|Null} if successful returns the inserted Question otherwise Null
	 */
	addQuestion(question, index) {
		if (question instanceof AbstractQuestion) {
			if (typeof index === "undefined" || index >= this.getQuestionList().length) {
				question.setQuestionIndex(this.getQuestionList().length);
				this[questionList].push(question);
			} else {
				question.setQuestionIndex(index);
				this[questionList].splice(index, 0, question);
				for (let i = index + 1; i < this.getQuestionList().length; i++) {
					this.getQuestionList()[i].setQuestionIndex(i);
				}
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
	removeQuestion(index) {
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
	getHashtag() {
		return this[hashtag];
	}

	setHashtag(newHashtag) {
		new SimpleSchema({
			hashtag: hashtagSchema
		}).validate({hashtag: newHashtag});
		this[hashtag] = newHashtag;
		this.getQuestionList().forEach(function (item) {
			item.setHashtag(newHashtag);
		});
		this.getConfiguration().setHashtag(newHashtag);
	}

	/**
	 * Returns the questionList of the questionGroup instance
	 * @returns {Array} The current list of questions
	 */
	getQuestionList() {
		return this[questionList];
	}

	getIsFirstStart() {
		return this[isFirstStart];
	}

	setIsFirstStart(value) {
		if (typeof value !== "boolean") {
			throw new Error("Invalid argument for AbstractQuestionGroup.setIsFirstStart");
		}
		this[isFirstStart] = value;
	}

	getConfiguration() {
		return this[sessionConfig];
	}

	setConfiguration(value) {
		this[sessionConfig] = value;
	}

	/**
	 * Serialize the instance object to a JSON compatible object
	 * @returns {{hashtag: String, type: String, questionList: Array}}
	 */
	serialize() {
		const questionListSerialized = [];
		this.getQuestionList().forEach(function (question) {
			questionListSerialized.push(question.serialize());
		});
		return {
			hashtag: this.getHashtag(),
			isFirstStart: this.getIsFirstStart(),
			questionList: questionListSerialized,
			configuration: this.getConfiguration().serialize()
		};
	}

	/**
	 * Checks if the properties of this instance are valid. Checks also recursively all including Question instances
	 * and summarizes their result of calling .isValid()
	 * @returns {boolean} True, if the complete QuestionGroup instance is valid, False otherwise
	 */
	isValid() {
		let questionListValid = this.getQuestionList().length > 0;
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
	equals(questionGroup) {
		if (questionGroup instanceof AbstractQuestionGroup) {
			if (questionGroup.getHashtag() !== this.getHashtag() ||
				questionGroup.getIsFirstStart() !== this.getIsFirstStart() ||
				!questionGroup.getConfiguration().equals(this.getConfiguration())) {
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
	toJSONValue() {
		return this.serialize();
	}

	/**
	 * Quick way to insert a default question to the QuestionGroup instance.
	 * @param {Number} [index] The index where the question should be inserted. If not passed, it will be added to the end of the questionList
	 * @param type
	 */
	addDefaultQuestion(index = -1, type = "SingleChoiceQuestion") {
		if (typeof index === "undefined" || index === -1 || index >= this.getQuestionList().length) {
			index = this.getQuestionList().length;
		}
		let questionItem = questionReflection[type]({
			hashtag: this.getHashtag(),
			questionText: "",
			questionIndex: index,
			timer: 40,
			startTime: 0,
			answerOptionList: []
		});
		this.addQuestion(questionItem, index);
	}
}
