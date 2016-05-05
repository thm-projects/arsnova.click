import {AbstractQuestion} from './question_abstract.js';

export class SurveyQuestion extends AbstractQuestion {

	constructor (options) {
		super(options);
	}

	addAnswerOption (answerOption) {
		if (answerOption.getIsCorrect()) {
			throw new Error("This question is not allowed to hold correct answers");
		}
		super.addAnswerOption(answerOption);
	}

	isValid() {
		return this.getAnswerOptionList().length > 0;
	}
}
