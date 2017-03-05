import {EJSON} from 'meteor/ejson';
import {AbstractChoiceQuestion} from './question_choice_abstract.js';

export class MultipleChoiceQuestion extends AbstractChoiceQuestion {

	/**
	 * Constructs a MultipleChoiceQuestion instance
	 * @see AbstractChoiceQuestion.constructor()
	 * @param options
	 */
	constructor (options) {
		if (typeof options.type !== "undefined" && options.type !== "MultipleChoiceQuestion") {
			throw new TypeError("Invalid construction type while creating new MultipleChoiceQuestion");
		}
		super(options);
	}

	/**
	 * Part of EJSON interface
	 * @see http://docs.meteor.com/api/ejson.html#EJSON-clone
	 * @returns {MultipleChoiceQuestion} An independent deep copy of the current instance
	 */
	clone () {
		return new MultipleChoiceQuestion(this.serialize());
	}

	/**
	 * Serialize the instance object to a JSON compatible object
	 * @returns {{hashtag:String,questionText:String,type:AbstractQuestion,timer:Number,startTime:Number,questionIndex:Number,answerOptionList:Array}}
	 */
	serialize () {
		return Object.assign(super.serialize(), {type: "MultipleChoiceQuestion"});
	}

	/**
	 * Part of EJSON interface.
	 * @see http://docs.meteor.com/api/ejson.html#EJSON-CustomType-typeName
	 * @returns {String} The name of the instantiated class
	 */
	typeName () {
		return "MultipleChoiceQuestion";
	}

	translationReferrer () {
		return "view.questions.multiple_choice_question";
	}

	/**
	 * Gets the validation error reason from the question and all included answerOptions as a stackable array
	 * @returns {Array} Contains an Object which holds the number of the current question and the reason why the validation has failed
	 */
	getValidationStackTrace () {
		const parentStackTrace = super.getValidationStackTrace();
		let hasValidAnswer = false;
		this.getAnswerOptionList().forEach(function (answeroption) {
			if (answeroption.getIsCorrect()) {
				hasValidAnswer = true;
			}
		});
		if (!hasValidAnswer) {
			parentStackTrace.push({occuredAt: {type: "question", id: this.getQuestionIndex()}, reason: "no_valid_answers"});
		}
		return parentStackTrace;
	}
}

/**
 * Adds a custom type to Meteor's EJSON
 * @see http://docs.meteor.com/api/ejson.html#EJSON-addType
 */
EJSON.addType("MultipleChoiceQuestion", function (value) {
	return new MultipleChoiceQuestion(value);
});
