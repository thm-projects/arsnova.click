import {EJSON} from 'meteor/ejson';
import {AbstractAnswerOption} from './answeroption_abstract.js';

export class DefaultAnswerOption extends AbstractAnswerOption {

	/**
	 * Constructs a DefaultAnswerOption instance
	 * @see AbstractAnswerOption.constructor()
	 * @param options
	 */
	constructor (options) {
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
}

/**
 * Adds a custom type to Meteor's EJSON
 * @see http://docs.meteor.com/api/ejson.html#EJSON-addType
 */
EJSON.addType("DefaultAnswerOption", function (value) {
	return new DefaultAnswerOption(value);
});
