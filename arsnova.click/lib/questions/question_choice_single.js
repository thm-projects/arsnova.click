import {EJSON} from 'meteor/ejson';
import {AbstractChoiceQuestion} from './question_choice_abstract.js';

export class SingleChoiceQuestion extends AbstractChoiceQuestion {

	/**
	 * Constructs a MultipleChoiceQuestion instance
	 * @see AbstractChoiceQuestion.constructor()
	 * @param options
	 */
	constructor (options) {
		if (typeof options.type !== "undefined" && options.type !== "SingleChoiceQuestion") {
			throw new TypeError("Invalid construction type while creating new SingleChoiceQuestion");
		}
		super(options);
	}

	/**
	 * Part of EJSON interface
	 * @see http://docs.meteor.com/api/ejson.html#EJSON-clone
	 * @returns {MultipleChoiceQuestion} An independent deep copy of the current instance
	 */
	clone () {
		return new SingleChoiceQuestion(this.serialize());
	}

	/**
	 * Serialize the instance object to a JSON compatible object
	 * @returns {{hashtag:String,questionText:String,type:AbstractQuestion,timer:Number,startTime:Number,questionIndex:Number,answerOptionList:Array}}
	 */
	serialize () {
		return $.extend(super.serialize(), {type: "SingleChoiceQuestion"});
	}

	/**
	 * Checks if the properties of this instance are valid. Checks also recursively all including AnswerOption instances
	 * and summarizes their result of calling .isValid(). Checks also if this Question instance contains exactly one correct AnswerOption
	 * @see AbstractChoiceQuestion.isValid()
	 * @returns {boolean} True, if the complete Question instance is valid, False otherwise
	 */
	isValid () {
		let hasValidAnswer = 0;
		this.getAnswerOptionList().forEach(function (answeroption) {
			if (answeroption.getIsCorrect()) {
				hasValidAnswer++;
			}
		});
		return super.isValid() && hasValidAnswer === 1;
	}

	/**
	 * Part of EJSON interface.
	 * @see http://docs.meteor.com/api/ejson.html#EJSON-CustomType-typeName
	 * @returns {String} The name of the instantiated class
	 */
	typeName () {
		return "SingleChoiceQuestion";
	}
}

/**
 * Adds a custom type to Meteor's EJSON
 * @see http://docs.meteor.com/api/ejson.html#EJSON-addType
 */
EJSON.addType("SingleChoiceQuestion", function (value) {
	return new SingleChoiceQuestion(value);
});
