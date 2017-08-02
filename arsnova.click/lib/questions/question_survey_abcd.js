import {EJSON} from 'meteor/ejson';
import {SurveyQuestion} from './question_survey.js';
import {DefaultAnswerOption} from '/lib/answeroptions/answeroption_default.js';

export class ABCDSurveyQuestion extends SurveyQuestion {

	/**
	 * Constructs a ABCDSurveyQuestion instance
	 * @see AbstractChoiceQuestion.constructor()
	 * @param options
	 */
	constructor(options) {
		if (typeof options.type !== "undefined" && options.type !== "ABCDSurveyQuestion") {
			throw new TypeError("Invalid construction type while creating new ABCDSurveyQuestion");
		}
		delete options.type;
		super(options);
	}

	/**
	 * Part of EJSON interface
	 * @see http://docs.meteor.com/api/ejson.html#EJSON-clone
	 * @returns {ABCDSurveyQuestion} An independent deep copy of the current instance
	 */
	clone() {
		return new ABCDSurveyQuestion(this.serialize());
	}

	/**
	 * Serialize the instance object to a JSON compatible object
	 * @returns {{hashtag:String,questionText:String,type:AbstractQuestion,timer:Number,startTime:Number,questionIndex:Number,answerOptionList:Array}}
	 */
	serialize() {
		return Object.assign(super.serialize(), {type: "ABCDSurveyQuestion"});
	}

	isValid() {
		return this.getAnswerOptionList().length > 1;
	}

	/**
	 * Part of EJSON interface.
	 * @see http://docs.meteor.com/api/ejson.html#EJSON-CustomType-typeName
	 * @returns {String} The name of the instantiated class
	 */
	typeName() {
		return "ABCDSurveyQuestion";
	}

	translationReferrer() {
		return "view.questions.survey_question_abcd";
	}

	removeAnswerOption() {
		throw Error("AnswerOptions cannot be modified for this type of Question!");
	}

	addDefaultAnswerOption() {
		throw Error("AnswerOptions cannot be modified for this type of Question!");
	}
}

/**
 * Adds a custom type to Meteor's EJSON
 * @see http://docs.meteor.com/api/ejson.html#EJSON-addType
 */
EJSON.addType("ABCDSurveyQuestion", function (value) {
	return new ABCDSurveyQuestion(value);
});
