import {AbstractQuestion} from './question_abstract.js';

export class AbstractChoiceQuestion extends AbstractQuestion {

	constructor (options) {
		super(options);
		if (this.constructor === AbstractChoiceQuestion) {
			throw new TypeError("Cannot construct Abstract instances directly");
		}
	}

	isValid () {
		let hasValidAnswer = false;
		this.getAnswerOptionList().forEach(function (answeroption) {
			if (answeroption.getIsCorrect()) {
				hasValidAnswer = true;
			}
		});
		return super.isValid() && this.getAnswerOptionList().length > 0 && hasValidAnswer;
	}
}
