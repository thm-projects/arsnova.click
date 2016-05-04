import {AbstractQuestion} from './question_abstract.js';

export class SingleChoiceQuestion extends AbstractQuestion {

	constructor (options) {
		super(options);
		this.correctAnswers = 0;
	}

	/**
	 *
	 * @override
	 * @param answerOption
	 */
	addAnswerOption (answerOption) {
		if (answerOption.isCorrect) {
			if (this.correctAnswers > 0) {
				throw new Error("This question has already a correct answer");
			} else {
				this.correctAnswers++;
			}
		}
		super.addAnswerOption(answerOption);
	}

	/**
	 *
	 * @override
	 * @param index
	 */
	removeAnswerOption (index) {
		this.correctAnswers--;
		super.removeAnswerOption(index);
	}
}
