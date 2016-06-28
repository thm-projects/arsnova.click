import {EJSON} from 'meteor/ejson';
import {SingleChoiceQuestion} from './question_choice_single.js';
import {DefaultAnswerOption} from '../answeroptions/answeroption_default.js';

export class TrueFalseSingleChoiceQuestion extends SingleChoiceQuestion {

	/**
	 * Constructs a TrueFalseSingleChoiceQuestion instance
	 * @see AbstractChoiceQuestion.constructor()
	 * @param options
	 */
	constructor (options) {
		if (typeof options.type !== "undefined" && options.type !== "TrueFalseSingleChoiceQuestion") {
			throw new TypeError("Invalid construction type while creating new TrueFalseSingleChoiceQuestion");
		}
		options.answerOptionList = [
			new DefaultAnswerOption({
				hashtag: options.hashtag,
				questionIndex: options.questionIndex,
				answerText: "lib.questions.question_choice_single_true_false.true",
				answerOptionNumber: 0,
				isCorrect: true
			}),
			new DefaultAnswerOption({
				hashtag: options.hashtag,
				questionIndex: options.questionIndex,
				answerText: "lib.questions.question_choice_single_true_false.false",
				answerOptionNumber: 1,
				isCorrect: false
			})
		];
		super(options);
	}

	/**
	 * Part of EJSON interface
	 * @see http://docs.meteor.com/api/ejson.html#EJSON-clone
	 * @returns {TrueFalseSingleChoiceQuestion} An independent deep copy of the current instance
	 */
	clone () {
		return new TrueFalseSingleChoiceQuestion(this.serialize());
	}

	/**
	 * Serialize the instance object to a JSON compatible object
	 * @returns {{hashtag:String,questionText:String,type:AbstractQuestion,timer:Number,startTime:Number,questionIndex:Number,answerOptionList:Array}}
	 */
	serialize () {
		return $.extend(super.serialize(), {type: "TrueFalseSingleChoiceQuestion"});
	}

	/**
	 * Part of EJSON interface.
	 * @see http://docs.meteor.com/api/ejson.html#EJSON-CustomType-typeName
	 * @returns {String} The name of the instantiated class
	 */
	typeName () {
		return "TrueFalseSingleChoiceQuestion";
	}

	addAnswerOption () {
		throw Error("AnswerOptions cannot be modified for this type of Question!");
	}

	removeAnswerOption () {
		throw Error("AnswerOptions cannot be modified for this type of Question!");
	}

	addDefaultAnswerOption () {
		throw Error("AnswerOptions cannot be modified for this type of Question!");
	}
}

/**
 * Adds a custom type to Meteor's EJSON
 * @see http://docs.meteor.com/api/ejson.html#EJSON-addType
 */
EJSON.addType("TrueFalseSingleChoiceQuestion", function (value) {
	return new TrueFalseSingleChoiceQuestion(value);
});
