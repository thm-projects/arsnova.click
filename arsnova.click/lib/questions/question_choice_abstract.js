import {Meteor} from 'meteor/meteor';
import {AbstractQuestion} from './question_abstract.js';
import {DefaultAnswerOption} from '../answeroptions/answeroption_default.js';
import {FreeTextAnswerOption} from "../answeroptions/answeroption_freetext.js";

const showOneAnswerPerRow = Symbol("showOneAnswerPerRow");

export class AbstractChoiceQuestion extends AbstractQuestion {

	/**
	 * Constructor super method for creating an AbstractChoiceQuestion instance
	 * This method cannot be invoked directly.
	 * @see AbstractQuestion.constructor()
	 * @param options
	 */
	constructor (options) {
		super(options);
		if (this.constructor === AbstractChoiceQuestion) {
			throw new TypeError("Cannot construct Abstract instances directly");
		}
		this[showOneAnswerPerRow] = typeof options.showOneAnswerPerRow === "undefined" ? Meteor.settings.public.default.question.showOneAnswerPerRow : options.showOneAnswerPerRow;
		if (typeof options.answerOptionList === "undefined" || options.answerOptionList.length === 0 || options.answerOptionList[0] instanceof FreeTextAnswerOption || options.answerOptionList[0].type === "FreeTextAnswerOption") {
			for (let i = 0; i < 4; i++) {
				this.addAnswerOption(
					new DefaultAnswerOption({
						hashtag: options.hashtag,
						questionIndex: options.questionIndex,
						answerText: "",
						answerOptionNumber: i,
						isCorrect: false
					})
				);
			}
		} else {
			for (let i = 0; i < options.answerOptionList.length; i++) {
				if (options.answerOptionList[i] instanceof DefaultAnswerOption) {
					this.addAnswerOption(options.answerOptionList[i]);
				} else if (options.answerOptionList[i] instanceof Object) {
					this.addAnswerOption(new DefaultAnswerOption(options.answerOptionList[i]));
				} else {
					throw new Error("Invalid argument list for " + this.constructor.name + " instantiation");
				}
			}
		}
	}

	setShowOneAnswerPerRow (newVal) {
		this[showOneAnswerPerRow] = newVal;
	}

	getShowOneAnswerPerRow () {
		return this[showOneAnswerPerRow];
	}

	/**
	 * Serialize the instance object to a JSON compatible object
	 * @returns {{hashtag:String,questionText:String,type:AbstractQuestion,timer:Number,startTime:Number,questionIndex:Number,answerOptionList:Array}}
	 */
	serialize () {
		return Object.assign(super.serialize(), {
			showOneAnswerPerRow: this.getShowOneAnswerPerRow()
		});
	}

	/**
	 * Checks if this question equals another question
	 * @param question {AbstractChoiceQuestion}
	 * @returns {boolean} True if both questions are equal. False otherwise.
	 */
	equals (question) {
		return super.equals(question) &&
			question.getShowOneAnswerPerRow() === this.getShowOneAnswerPerRow();
	}

	/**
	 * Checks if the properties of this instance are valid. Checks also recursively all including AnswerOption instances
	 * and summarizes their result of calling .isValid()
	 * @see AbstractQuestion.isValid()
	 * @returns {boolean} True, if the complete Question instance is valid, False otherwise
	 */
	isValid () {
		let hasValidAnswer = false;
		this.getAnswerOptionList().forEach(function (answeroption) {
			if (answeroption.getIsCorrect()) {
				hasValidAnswer = true;
			}
		});
		return super.isValid() && this.getAnswerOptionList().length > 0 && hasValidAnswer;
	}

	isParentValid () {
		return super.isValid();
	}

	/**
	 * Gets the validation error reason from the question and all included answerOptions as a stackable array
	 * @returns {Array} Contains an Object which holds the number of the current question and the reason why the validation has failed
	 */
	getValidationStackTrace () {
		return super.getValidationStackTrace();
	}
}
