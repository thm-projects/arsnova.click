import {EJSON} from 'meteor/ejson';
import {AbstractChoiceQuestion} from './question_choice_abstract.js';

export class SingleChoiceQuestion extends AbstractChoiceQuestion {

	constructor (options) {
		super(options);
	}

	clone () {
		return new SingleChoiceQuestion(this.serialize());
	}
}

EJSON.addType("SingleChoiceQuestion", function (value) {
	return new SingleChoiceQuestion(value);
});
