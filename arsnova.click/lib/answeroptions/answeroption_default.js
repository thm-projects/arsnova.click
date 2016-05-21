import {EJSON} from 'meteor/ejson';
import {AbstractAnswerOption} from './answeroption_abstract.js';

export class DefaultAnswerOption extends AbstractAnswerOption {

	constructor (options) {
		super(options);
	}

	clone () {
		return new DefaultAnswerOption(this.serialize());
	}
}

EJSON.addType("DefaultAnswerOption", function (value) {
	return new DefaultAnswerOption(value);
});
