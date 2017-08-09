import {EJSON} from 'meteor/ejson';
import {SingleChoiceQuestion} from './question_choice_single.js';

export class ABCDSingleChoiceQuestion extends SingleChoiceQuestion {

	/**
	 * Constructs a ABCDSingleChoiceQuestion instance
	 * @see AbstractChoiceQuestion.constructor()
	 * @param options
	 */
	constructor(options) {
		if (typeof options.type !== "undefined" && options.type !== "ABCDSingleChoiceQuestion") {
			throw new TypeError("Invalid construction type while creating new ABCDSingleChoiceQuestion");
		}
		delete options.type;
		super(options);
	}

	/**
	 * Part of EJSON interface
	 * @see http://docs.meteor.com/api/ejson.html#EJSON-clone
	 * @returns {ABCDSingleChoiceQuestion} An independent deep copy of the current instance
	 */
	clone() {
		return new ABCDSingleChoiceQuestion(this.serialize());
	}

	/**
	 * Serialize the instance object to a JSON compatible object
	 * @returns {{hashtag:String,questionText:String,type:AbstractQuestion,timer:Number,startTime:Number,questionIndex:Number,answerOptionList:Array}}
	 */
	serialize() {
		return Object.assign(super.serialize(), {type: "ABCDSingleChoiceQuestion"});
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
		return "ABCDSingleChoiceQuestion";
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
EJSON.addType("ABCDSingleChoiceQuestion", function (value) {
	return new ABCDSingleChoiceQuestion(value);
});
