import {EJSON} from 'meteor/ejson';
import {AbstractAnswerOption} from './answeroption_abstract.js';

const configCaseSensitive = Symbol("configCaseSensitive");
const configTrimWhitespaces = Symbol("configTrimWhitespaces");
const configUseKeywords = Symbol("configUseKeywords");
const configUsePunctuation = Symbol("configUsePunctuation");

const TYPE = "FreeTextAnswerOption";

export class FreeTextAnswerOption extends AbstractAnswerOption {

	/**
	 * Constructs a FreeTextAnswerOption instance
	 * @see AbstractAnswerOption.constructor()
	 * @param {{hashtag:String,questionIndex:Number,answerText:String,answerOptionNumber:Number,type:String,configCaseSensitive:Boolean,configTrimWhitespaces:Boolean,configUseKeywords:Boolean,configUsePunctuation:Boolean}} options An object containing the parameters for creating an AnswerOption instance. The type attribute is optional.
	 */
	constructor (options) {
		if (typeof options.type !== "undefined" && options.type !== TYPE) {
			throw new TypeError("Invalid construction type while creating new " + TYPE);
		}
		if (typeof options.configCaseSensitive === "undefined" ||
			typeof options.configTrimWhitespaces === "undefined" ||
			typeof options.configUseKeywords === "undefined" ||
			typeof options.configUsePunctuation === "undefined") {
			throw new Error("Invalid parameter list for new " + TYPE + ", got: ", options);
		}
		super(options);
		this[configCaseSensitive] = options.configCaseSensitive;
		this[configTrimWhitespaces] = options.configTrimWhitespaces;
		this[configUseKeywords] = options.configUseKeywords;
		this[configUsePunctuation] = options.configUsePunctuation;
	}

	/**
	 * Returns the currently set configuration if the match of the correct answer is case sensitive
	 * @returns {Boolean} The currently set configuration for the case sensitive check
	 */
	getConfigCaseSensitive () {
		return this[configCaseSensitive];
	}

	/**
	 * Sets the currently set configuration if the match of the correct answer is case sensitive
	 * @param {Boolean} newVal The new configuration setting
	 */
	setConfigCaseSensitive (newVal) {
		if (typeof newVal === "undefined" || typeof newVal !== "boolean") {
			throw TypeError("Invalid argument for " + TYPE + ".setConfigCaseSensitive: ", newVal);
		}
		this[configCaseSensitive] = newVal;
	}

	/**
	 * Returns the currently set configuration if the match of the correct answer is case sensitive
	 * @returns {Boolean} The currently set configuration for the case sensitive check
	 */
	getConfigTrimWhitespaces () {
		return this[configTrimWhitespaces];
	}

	/**
	 * Sets the currently set configuration if the match of the correct answer is case sensitive
	 * @param {Boolean} newVal The new configuration setting
	 */
	setConfigTrimWhitespaces (newVal) {
		if (typeof newVal === "undefined" || typeof newVal !== "boolean") {
			throw TypeError("Invalid type for " + TYPE + ".setConfigTrimWhitespaces: ", newVal);
		}
		this[configTrimWhitespaces] = newVal;
	}

	/**
	 * Returns the currently set configuration if the match of the correct answer is case sensitive
	 * @returns {Boolean} The currently set configuration for the case sensitive check
	 */
	getConfigUseKeywords () {
		return this[configUseKeywords];
	}

	/**
	 * Sets the currently set configuration if the match of the correct answer is case sensitive
	 * @param {Boolean} newVal The new configuration setting
	 */
	setConfigUseKeywords (newVal) {
		if (typeof newVal === "undefined" || typeof newVal !== "boolean") {
			throw TypeError("Invalid type for " + TYPE + ".setConfigUseKeywords: ", newVal);
		}
		this[configUseKeywords] = newVal;
	}

	/**
	 * Returns the currently set configuration if the match of the correct answer is case sensitive
	 * @returns {Boolean} The currently set configuration for the case sensitive check
	 */
	getConfigUsePunctuation () {
		return this[configUsePunctuation];
	}

	/**
	 * Sets the currently set configuration if the match of the correct answer is case sensitive
	 * @param {Boolean} newVal The new configuration setting
	 */
	setConfigUsePunctuation (newVal) {
		if (typeof newVal === "undefined" || typeof newVal !== "boolean") {
			throw TypeError("Invalid type for " + TYPE + ".setConfigUsePunctuation: ", newVal);
		}
		this[configUsePunctuation] = newVal;
	}

	/**
	 * Part of EJSON interface
	 * @see http://docs.meteor.com/api/ejson.html#EJSON-clone
	 * @returns {FreeTextAnswerOption} An independent deep copy of the current instance
	 */
	clone () {
		return new FreeTextAnswerOption(this.serialize());
	}

	/**
	 * Serialize the instance object to a JSON compatible object
	 * @returns {{hashtag:String,questionIndex:Number,answerText:String,answerOptionNumber:Number,configCaseSensitive:Boolean,configTrimWhitespaces:Boolean,configUseKeywords:Boolean,configUseKeywords:Boolean,configUsePunctuation:Boolean,type:String}}
	 */
	serialize () {
		return $.extend(super.serialize(), {
			configCaseSensitive: this.getConfigCaseSensitive(),
			configTrimWhitespaces: this.getConfigTrimWhitespaces(),
			configUseKeywords: this.getConfigUseKeywords(),
			configUsePunctuation: this.getConfigUsePunctuation(),
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
			answerOption instanceof FreeTextAnswerOption &&
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
	 * @returns {{hashtag:String,questionIndex:Number,answerText:String,answerOptionNumber:Number,configCaseSensitive:Boolean,configTrimWhitespaces:Boolean,configUseKeywords:Boolean,configUseKeywords:Boolean,configUsePunctuation:Boolean,type:String}}
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
	return new FreeTextAnswerOption(value);
});
