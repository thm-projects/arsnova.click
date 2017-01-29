import {Meteor} from 'meteor/meteor';
import {EJSON} from 'meteor/ejson';
import {AbstractChoiceQuestion} from './question_choice_abstract.js';

const multipleSelectionEnabled = Symbol("multipleSelectionEnabled");

export class SurveyQuestion extends AbstractChoiceQuestion {

	/**
	 * Constructs a RangedQuestion instance
	 * @see AbstractQuestion.constructor()
	 * @param options
	 */
	constructor (options) {
		if (typeof options.type !== "undefined" && options.type !== "SurveyQuestion") {
			throw new TypeError("Invalid construction type while creating new SurveyQuestion");
		}
		super(options);
		this[multipleSelectionEnabled] = typeof options.multipleSelectionEnabled === "undefined" ? Meteor.settings.public.default.question.multipleSurveySelectionEnabled : options.multipleSelectionEnabled;
	}

	setMultipleSelectionEnabled (newVal) {
		this[multipleSelectionEnabled] = newVal;
	}

	getMultipleSelectionEnabled () {
		return this[multipleSelectionEnabled];
	}

	/**
	 * Checks if the properties of this instance are valid. Checks also recursively all including AnswerOption instances
	 * and summarizes their result of calling .isValid(). Checks if the Question has exactly zero correct AnswerOptions
	 * @see AbstractQuestion.isValid()
	 * @returns {boolean} True, if the complete Question instance is valid, False otherwise
	 */
	isValid () {
		let hasValidAnswer = 0;
		this.getAnswerOptionList().forEach(function (answeroption) {
			if (answeroption.getIsCorrect()) {
				hasValidAnswer++;
			}
		});
		return super.isParentValid() && hasValidAnswer === 0;
	}

	/**
	 * Gets the validation error reason from the question and all included answerOptions as a stackable array
	 * @returns {Array} Contains an Object which holds the number of the current question and the reason why the validation has failed
	 */
	getValidationStackTrace () {
		let hasValidAnswer = 0;
		this.getAnswerOptionList().forEach(function (answeroption) {
			if (answeroption.getIsCorrect()) {
				hasValidAnswer++;
			}
		});
		const parentStackTrace = super.getValidationStackTrace();
		if (hasValidAnswer !== 0) {
			parentStackTrace.push({occuredAt: {type: "question", id: this.getQuestionIndex()}, reason: "no_valid_answer_required"});
		}
		return parentStackTrace;
	}

	/**
	 * Part of EJSON interface
	 * @see http://docs.meteor.com/api/ejson.html#EJSON-clone
	 * @returns {SurveyQuestion} An independent deep copy of the current instance
	 */
	clone () {
		return new SurveyQuestion(this.serialize());
	}

	/**
	 * Serialize the instance object to a JSON compatible object
	 * @returns {{hashtag:String,questionText:String,type:AbstractQuestion,timer:Number,startTime:Number,questionIndex:Number,answerOptionList:Array}}
	 */
	serialize () {
		return $.extend(super.serialize(), {
			type: "SurveyQuestion",
			multipleSelectionEnabled: this.getMultipleSelectionEnabled()
		});
	}

	equals (question) {
		return question.typeName() === this.typeName() &&
			super.equals(question) &&
			question.getMultipleSelectionEnabled() === this.getMultipleSelectionEnabled();
	}

	/**
	 * Part of EJSON interface.
	 * @see http://docs.meteor.com/api/ejson.html#EJSON-CustomType-typeName
	 * @returns {String} The name of the instantiated class
	 */
	typeName () {
		return "SurveyQuestion";
	}

	translationReferrer () {
		return "view.questions.survey_question";
	}
}

/**
 * Adds a custom type to Meteor's EJSON
 * @see http://docs.meteor.com/api/ejson.html#EJSON-addType
 */
EJSON.addType("SurveyQuestion", function (value) {
	return new SurveyQuestion(value);
});
