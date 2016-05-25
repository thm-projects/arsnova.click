import {EJSON} from 'meteor/ejson';
import {AbstractQuestionGroup} from './questiongroup_abstract.js';

export class DefaultQuestionGroup extends AbstractQuestionGroup {

	/**
	 * Constructs a DefaultQuestionGroup instance
	 * @see AbstractQuestionGroup.constructor()
	 * @param options
	 */
	constructor (options) {
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
}

/**
 * Adds a custom type to Meteor's EJSON
 * @see http://docs.meteor.com/api/ejson.html#EJSON-addType
 */
EJSON.addType("DefaultQuestionGroup", function (value) {
	return new DefaultQuestionGroup(value);
});

