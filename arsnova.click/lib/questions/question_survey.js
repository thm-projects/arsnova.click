import {AbstractQuestion} from './question_abstract.js';

export class SurveyQuestion extends AbstractQuestion {

	constructor (options) {
		super(options);
	}

	/**
	 *
	 * @override
	 * @param answerOption
	 */
	addAnswerOption (answerOption) {
		if (answerOption.isCorrect) {
			throw new Error("This question is not allowed to hold correct answers");
		}
		super.addAnswerOption(answerOption);
	}
}