import {EJSON} from 'meteor/ejson';
import {AbstractAnswerOption} from './answeroption_abstract.js';

const isCorrect = Symbol("isCorrect");

const TYPE = "DefaultAnswerOption";

export class DefaultAnswerOption extends AbstractAnswerOption {

	/**
	 * Constructs a DefaultAnswerOption instance
	 * @see AbstractAnswerOption.constructor()
	 * @param {{hashtag:String,questionIndex:Number,answerText:String,answerOptionNumber:Number,isCorrect:Boolean,type:String}} options An object containing the parameters for creating an AnswerOption instance. The type attribute is optional.
	 */
	constructor (options) {
		if (typeof options.type !== "undefined" && options.type !== TYPE) {
			throw new TypeError("Invalid construction type while creating new " + TYPE);
		}
		if (typeof options.isCorrect === "undefined") {
			throw new Error("Invalid argument list for new " + TYPE + ", got: ", options);
		}
		super(options);
		this[isCorrect] = options.isCorrect;
	}

	/**
	 * Returns whether this AnswerOption instance is currently marked as correct
	 * @returns {Boolean} True if this AnswerOption instance is marked as correct, False otherwise
	 */
	getIsCorrect () {
		return this[isCorrect];
	}

	/**
	 * Set the correct-mark for this AnswerOption instance
	 * @param {Boolean} value True, if this AnswerOption shall be marked as correct, False otherwise
	 * @throws {Error} If the value is not of type Boolean
	 */
	setIsCorrect (value) {
		if (typeof value !== "boolean") {
			throw new Error("Invalid argument for " + TYPE + ".setIsCorrect");
		}
		this[isCorrect] = value;
	}

	/**
	 * Part of EJSON interface
	 * @see http://docs.meteor.com/api/ejson.html#EJSON-clone
	 * @returns {DefaultAnswerOption} An independent deep copy of the current instance
	 */
	clone () {
		return new DefaultAnswerOption(this.serialize());
	}

	/**
	 * Serialize the instance object to a JSON compatible object
	 * @returns {{hashtag: String, type: String, questionIndex: Number, answerText: String, answerOptionNumber: Number, isCorrect: Boolean}}
	 */
	serialize () {
		return $.extend(super.serialize(), {
			isCorrect: this.getIsCorrect(),
			type: TYPE
		});
	}

	/**
	 * Checks for equivalence relations to another AnswerOption instance. Also part of the EJSON interface
	 * @see http://docs.meteor.com/api/ejson.html#EJSON-CustomType-equals
	 * @param {AbstractAnswerOption} answerOption The AnswerOption instance which should be checked
	 * @returns {boolean} True if both instances are completely equal, False otherwise
	 */
	equals (answerOption) {
		return super.equals(answerOption) &&
			answerOption instanceof DefaultAnswerOption &&
			answerOption.getIsCorrect() === this.getIsCorrect();
	}

	/**
	 * Part of EJSON interface.
	 * @see http://docs.meteor.com/api/ejson.html#EJSON-CustomType-typeName
	 * @returns {String} The name of the instantiated class
	 */
	typeName () {
		return TYPE;
	}

	/**
	 * Part of EJSON interface
	 * @see AbstractAnswerOption.serialize()
	 * @see http://docs.meteor.com/api/ejson.html#EJSON-CustomType-toJSONValue
	 * @returns {{hashtag: String, type: String, questionIndex: Number, answerText: String, answerOptionNumber: Number, isCorrect: Boolean}}
	 */
	toJSONValue () {
		return this.serialize();
	}
}

/**
 * Adds a custom type to Meteor's EJSON
 * @see http://docs.meteor.com/api/ejson.html#EJSON-addType
 */
EJSON.addType(TYPE, function (value) {
	return new DefaultAnswerOption(value);
});
