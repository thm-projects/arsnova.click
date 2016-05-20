import {EJSON} from 'meteor/ejson';
import {AbstractChoiceQuestion} from './question_choice_abstract.js';

export class MultipleChoiceQuestion extends AbstractChoiceQuestion {

	constructor (options) {
		super(options);
	}

	clone () {
		return new MultipleChoiceQuestion(this.serialize());
	}
}

EJSON.addType("MultipleChoiceQuestion", function (value) {
	return new MultipleChoiceQuestion(value);
});
