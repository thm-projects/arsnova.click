import {EJSON} from 'meteor/ejson';
import {AbstractAnswerOption} from './answeroption_abstract.js';

export class DefaultAnswerOption extends AbstractAnswerOption {

	/**
	 * Constructs a DefaultAnswerOption instance
	 * @see AbstractAnswerOption.constructor()
	 * @param options
	 */
	constructor (options) {
		if (typeof options.type !== "undefined" && options.type !== "DefaultAnswerOption") {
			throw new TypeError("Invalid construction type while creating new DefaultAnswerOption");
		}
		super(options);
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
	 * @returns {{hashtag:String,questionText:String,type:AbstractQuestion,timer:Number,startTime:Number,questionIndex:Number,answerOptionList:Array}}
	 */
	serialize () {
		return $.extend(super.serialize(), {type: "DefaultAnswerOption"});
	}

	/**
	 * Part of EJSON interface.
	 * @see http://docs.meteor.com/api/ejson.html#EJSON-CustomType-typeName
	 * @returns {String} The name of the instantiated class
	 */
	static typeName () {
		return "DefaultAnswerOption";
	}
}

/**
 * Adds a custom type to Meteor's EJSON
 * @see http://docs.meteor.com/api/ejson.html#EJSON-addType
 */
EJSON.addType("DefaultAnswerOption", function (value) {
	return new DefaultAnswerOption(value);
});
