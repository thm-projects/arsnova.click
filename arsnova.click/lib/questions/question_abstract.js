import {Meteor} from 'meteor/meteor';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {hashtagSchema} from '/lib/hashtags/collection.js';
import {AbstractAnswerOption} from '../answeroptions/answeroption_abstract.js';
import {DefaultAnswerOption} from '../answeroptions/answeroption_default.js';

const hashtag = Symbol("hashtag");
const questionText = Symbol("questionText");
const isFirstStart = Symbol("isFirstStart");
const timer = Symbol("timer");
const startTime = Symbol("startTime");
const questionIndex = Symbol("questionIndex");
const answerOptionList = Symbol("answerOptionList");
const displayAnswerText = Symbol("displayAnswerText");

export class AbstractQuestion {

	/**
	 * Constructor super method for creating a Question instance
	 * This method cannot be invoked directly.
	 * @param {{hashtag:String,questionText:String,timer:Number,startTime:Number,questionIndex:Number,type:String,answerOptionList:Array}} options An object containing the parameters for creating a Question instance. The type and answerOptionList attributes are optional.
	 * @throws {TypeError} If this method is invoked directly, the options Object is undefined or the optional type attribute is not matching the constructor name
	 * @throws {Error} If the hashtag or the questionIndex attributes of the options Object are missing
	 */
	constructor (options) {
		if (this.constructor === AbstractQuestion) {
			throw new TypeError("Cannot construct Abstract instances directly");
		}
		if (typeof options.hashtag === "undefined" || typeof options.questionIndex === "undefined") {
			throw new Error("Invalid argument list for Question instantiation");
		}
		this[hashtag] = options.hashtag;
		this[isFirstStart] = typeof options.isFirstStart === "undefined" ? true : options.isFirstStart;
		this[questionIndex] = options.questionIndex;
		this[questionText] = options.questionText || Meteor.settings.public.default.question.text;
		this[timer] = options.timer || Meteor.settings.public.default.question.timer;
		this[startTime] = options.startTime || 0;
		this[displayAnswerText] = typeof options.displayAnswerText === "undefined" ? Meteor.settings.public.default.answers.displayAnswerTextOnButtons : options.displayAnswerText;
		this[answerOptionList] = [];
	}

	/**
	 * Returns the Hashtag of the Question instance
	 * @returns {String} The hashtag identifying the session
	 */
	getHashtag () {
		return this[hashtag];
	}

	setHashtag (newHashtag) {
		new SimpleSchema({
			hashtag: hashtagSchema
		}).validate({hashtag: newHashtag});
		this[hashtag] = newHashtag;
		this.getAnswerOptionList().forEach(function (item) {
			item.setHashtag(newHashtag);
		});
	}

	getIsFirstStart () {
		return this[isFirstStart];
	}

	setIsFirstStart (value) {
		if (typeof value !== "boolean") {
			throw new Error("Invalid argument for AbstractQuestion.setIsFirstStart");
		}
		this[isFirstStart] = value;
	}

	/**
	 * Sets the question text for the Question instance displayed during the quiz
	 * @param {String} text The text which will be displayed during the quiz
	 * @throws {Error} If the text is not of type String
	 */
	setQuestionText (text) {
		if (typeof text !== "string") {
			throw new Error("Invalid argument for Question.setText");
		}
		this[questionText] = text;
	}

	/**
	 * Returns the currently set question text
	 * @returns {String} The current question text
	 */
	getQuestionText () {
		return this[questionText];
	}

	/**
	 * Returns the current index of the question
	 * @returns {Number} The current index of the question
	 */
	getQuestionIndex () {
		return this[questionIndex];
	}

	/**
	 * Sets the index of the question and populates the changes to the AnswerOptions of this Question instance
	 * @param {Number} index The new index of the question
	 */
	setQuestionIndex (index) {
		this[questionIndex] = index;
		for (let i = 0; i < this.getAnswerOptionList().length; i++) {
			this.getAnswerOptionList()[i].setQuestionIndex(index);
		}
	}

	/**
	 * Sets the timer of the Question instance
	 * @param {Number} time The timer for the questions countdown. Must be in seconds.
	 * @throws {Error} If the time is not of type Number
	 */
	setTimer (time) {
		if (typeof time !== "number") {
			throw new Error("Invalid argument for Question.setTimer");
		}
		this[timer] = time;
	}

	/**
	 * Returns the currently set timer value
	 * @returns {Number} The current timer value
	 */
	getTimer () {
		return this[timer];
	}

	/**
	 * Sets the start time of the question countdown
	 * @param {Number} time The timestamp of the Date() Object where the question starts
	 * @throws {Error} If the timestamp is not of type Number or is in the past
	 */
	setStartTime (time) {
		if (typeof time !== "number" || new Date(time) <= new Date()) {
			throw new Error("Invalid argument for Question.setStartTime");
		}
		this[startTime] = time;
	}

	/**
	 * Returns the currently set start time
	 * @returns {Number} The currently set start time
	 */
	getStartTime () {
		return this[startTime];
	}

	/**
	 * Adds a new AnswerOption to the Question instance
	 * @param {AbstractAnswerOption} answerOption The AnswerOption instance to be added
	 * @param {Number} [index] An optional index where the AnswerOption instance should be added. If not set or set to an invalid value the instance is added to the end of the answerOptionList
	 * @throws {Error} If the answerOption is not of tye AbstractAnswerOption
	 */
	addAnswerOption (answerOption, index) {
		if (typeof answerOption === "undefined" || !(answerOption instanceof AbstractAnswerOption)) {
			throw new Error("Invalid argument for Question.addAnswerOption");
		}
		if (typeof index === "undefined" || index < 0 || index >= this.getAnswerOptionList().length) {
			answerOption.setAnswerOptionNumber(this.getAnswerOptionList().length);
			this[answerOptionList].push(answerOption);
		} else {
			answerOption.setAnswerOptionNumber(index);
			this[answerOptionList].splice(index, 0, answerOption);
			for (let i = index + 1; i < this.getAnswerOptionList().length; i++) {
				this.getAnswerOptionList()[i].setAnswerOptionNumber(i);
			}
		}
	}

	/**
	 * Removes an AnswerOption from the answerOptionList
	 * @param {Number} index The index of the AnswerOption instance which shall be removed
	 * @throws {Error} If the index is not set or set to an invalid value
	 */
	removeAnswerOption (index) {
		if (typeof index === "undefined" || index < 0 || index > this.getAnswerOptionList().length) {
			throw new Error("Invalid argument for Question.removeAnswerOption");
		}
		this[answerOptionList].splice(index, 1);
		for (let i = index; i < this.getAnswerOptionList().length; i++) {
			this.getAnswerOptionList()[i].setAnswerOptionNumber(i);
		}
	}

	/**
	 * Removes all AnswerOption instances in the answerOptionList.
	 * The AnswerOption instance objects are not destroyed
	 */
	removeAllAnswerOptions () {
		this[answerOptionList] = [];
	}

	/**
	 * Returns the answerOptionList
	 * @returns {Array} The list of all AnswerOptions currently hold by this Question instance
	 */
	getAnswerOptionList () {
		return this[answerOptionList];
	}

	/**
	 * Serialize the instance object to a JSON compatible object
	 * @returns {{hashtag:String,questionText:String,type:AbstractQuestion,timer:Number,startTime:Number,questionIndex:Number,answerOptionList:Array}}
	 */
	serialize () {
		let answerOptionListSerialized = [];
		this.getAnswerOptionList().forEach(function (answeroption) { answerOptionListSerialized.push(answeroption.serialize()); });
		return {
			hashtag: this.getHashtag(),
			isFirstStart: this.getIsFirstStart(),
			questionText: this.getQuestionText(),
			timer: this.getTimer(),
			startTime: this.getStartTime(),
			questionIndex: this.getQuestionIndex(),
			displayAnswerText: this.getDisplayAnswerText(),
			answerOptionList: answerOptionListSerialized
		};
	}

	/**
	 * Checks if the properties of this instance are valid. Checks also recursively all including AnswerOption instances
	 * and summarizes their result of calling .isValid()
	 * @returns {boolean} True, if the complete Question instance is valid, False otherwise
	 */
	isValid () {
		let answerOptionListValid = true;
		this.getAnswerOptionList().forEach(function (answerOption) {
			if (!answerOption.isValid()) {
				answerOptionListValid = false;
			}
		});
		const questionTextWithoutMarkdownChars = this.getQuestionTextWithoutMarkdownChars().length;

		// hard coded checkup values are ugly, but the schema import seems to be messed up here...
		return answerOptionListValid && questionTextWithoutMarkdownChars > 4 && questionTextWithoutMarkdownChars < 50001 && this.getTimer() > 0;
	}

	getDisplayAnswerText () {
		return this[displayAnswerText];
	}

	setDisplayAnswerText (newVal) {
		this[displayAnswerText] = newVal;
	}

	/**
	 * @returns {String} The question text without the markdown characters
	 */
	getQuestionTextWithoutMarkdownChars () {
		return this.getQuestionText().replace(/[\W\s]*/, "");
	}

	/**
	 * Gets the validation error reason from the question and all included answerOptions as a stackable array
	 * @returns {Array} Contains an Object which holds the number of the current question and the reason why the validation has failed
	 */
	getValidationStackTrace () {
		const result = [];
		const questionTextWithoutMarkdownChars = this.getQuestionTextWithoutMarkdownChars().length;
		if (questionTextWithoutMarkdownChars < 5) {
			result.push({occuredAt: {type: "question", id: this.getQuestionIndex()}, reason: "question_text_too_small"});
		} else if (questionTextWithoutMarkdownChars > 50000) {
			result.push({occuredAt: {type: "question", id: this.getQuestionIndex()}, reason: "question_text_too_long"});
		}
		if (this.getTimer() < 1) {
			result.push({occuredAt: {type: "question", id: this.getQuestionIndex()}, reason: "timer_too_small"});
		}
		this.getAnswerOptionList().forEach(function (answerOption) {
			if (!answerOption.isValid()) {
				$.merge(result, answerOption.getValidationStackTrace());
			}
		});
		return result;
	}

	/**
	 * Checks for equivalence relations to another Question instance. Also part of the EJSON interface
	 * @see http://docs.meteor.com/api/ejson.html#EJSON-CustomType-equals
	 * @param {AbstractQuestion} question The Question instance which should be checked
	 * @returns {boolean} True if both instances are completely equal, False otherwise
	 */
	equals (question) {
		if (!(question instanceof AbstractQuestion)) {
			return false;
		}

		let questionAnswerOptionList = question.getAnswerOptionList();
		if (questionAnswerOptionList.length === this.getAnswerOptionList().length) {
			let isEqual = true;
			for (let i = 0; i < this.getAnswerOptionList().length; i++) {
				if (isEqual && !this.getAnswerOptionList()[i].equals(questionAnswerOptionList[i])) {
					isEqual = false;
				}
			}
			if (question.getTimer() !== this.getTimer() ||
				question.getStartTime() !== this.getStartTime() ||
				question.getHashtag() !== this.getHashtag() ||
				question.getIsFirstStart() !== this.getIsFirstStart() ||
				question.getDisplayAnswerText() !== this.getDisplayAnswerText() ||
				question.getQuestionText() !== this.getQuestionText()) {
				isEqual = false;
			}
			return isEqual;
		}
	}

	/**
	 * Part of EJSON interface
	 * @see AbstractQuestion.serialize()
	 * @see http://docs.meteor.com/api/ejson.html#EJSON-CustomType-toJSONValue
	 * @returns {{hashtag,questionText,type,timer,startTime,questionIndex,answerOptionList}|{hashtag:String,questionText:String,type:AbstractQuestion,timer:Number,startTime:Number,questionIndex:Number,answerOptionList:Array}}
	 */
	toJSONValue () {
		return this.serialize();
	}

	/**
	 * Quick way to insert a default AnswerOption to the Question instance.
	 * @param {Number} [index] The index where the AnswerOption should be inserted. If not passed, it will be added to the end of the answerOptionList
	 */
	addDefaultAnswerOption (index) {
		if (typeof index === "undefined" || index >= this.getAnswerOptionList().length) {
			index = this.getAnswerOptionList().length;
		}
		this.addAnswerOption(
			new DefaultAnswerOption({
				hashtag: this.getHashtag(),
				questionIndex: this.getQuestionIndex(),
				answerText: "",
				answerOptionNumber: index,
				isCorrect: false
			}),
			index
		);
	}
}
