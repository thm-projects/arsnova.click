import {EJSON} from 'meteor/ejson';
import {AbstractChoiceQuestion} from './question_choice_abstract.js';

export class SingleChoiceQuestion extends AbstractChoiceQuestion {

	constructor (options) {
		super(options);
	}

	clone () {
		return new SingleChoiceQuestion(this.serialize());
	}

	isValid () {
		let hasValidAnswer = 0;
		this.getAnswerOptionList().forEach(function (answeroption) {
			if (answeroption.getIsCorrect()) {
				hasValidAnswer++;
			}
		});
		return super.isValid() && hasValidAnswer === 1;
	}
}

EJSON.addType("SingleChoiceQuestion", function (value) {
	return new SingleChoiceQuestion(value);
});
