import {EJSON} from 'meteor/ejson';
import {AbstractQuestionGroup} from './questiongroup_abstract.js';

export class DefaultQuestionGroup extends AbstractQuestionGroup {

	/**
	 * Constructs a DefaultQuestionGroup instance
	 * @see AbstractQuestionGroup.constructor()
	 * @param options
	 */
	constructor (options) {
		if (typeof options.type !== "undefined" && options.type !== "DefaultQuestionGroup") {
			throw new TypeError("Invalid construction type while creating new DefaultQuestionGroup: " + options.type);
		}
		super(options);
	}

	/**
	 * Part of EJSON interface
	 * @see http://docs.meteor.com/api/ejson.html#EJSON-clone
	 * @returns {DefaultQuestionGroup} An independent deep copy of the current instance
	 */
	clone () {
		return new DefaultQuestionGroup(this.serialize());
	}

	/**
	 * Serialize the instance object to a JSON compatible object
	 * @returns {{hashtag: String, type: String, questionList: Array}}
	 */
	serialize () {
		return $.extend(super.serialize(), {type: "DefaultQuestionGroup"});
	}

	/**
	 * Part of EJSON interface.
	 * @see http://docs.meteor.com/api/ejson.html#EJSON-CustomType-typeName
	 * @returns {String} The name of the instantiated class
	 */
	typeName () {
		return "DefaultQuestionGroup";
	}
}

/**
 * Adds a custom type to Meteor's EJSON
 * @see http://docs.meteor.com/api/ejson.html#EJSON-addType
 */
EJSON.addType("DefaultQuestionGroup", function (value) {
	return new DefaultQuestionGroup(value);
});

