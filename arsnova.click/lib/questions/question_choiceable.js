import {AbstractQuestion} from './question_abstract.js';

export class ChoicableQuestion extends AbstractQuestion {

	constructor (options) {
		super(options);
	}

	isValid () {
		let hasValidAnswer = false;
		this.getAnswerOptionList().forEach(function (answeroption) {
			if (answeroption.isCorrect === 1) {
				hasValidAnswer = true;
			}
		});
		return this.getAnswerOptionList().length > 0 && hasValidAnswer;
	}
}
