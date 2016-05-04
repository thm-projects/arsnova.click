import {AbstractQuestion} from './question_abstract.js';

const correctAnswerCount = Symbol("correctAnswerCount");

export class SingleChoiceQuestion extends AbstractQuestion {

	constructor (options) {
		super(options);
		this[correctAnswerCount] = 0;
	}

	/**
	 *
	 * @override
	 * @param answerOption
	 */
	addAnswerOption (answerOption) {
		if (answerOption.isCorrect) {
			if (this[correctAnswerCount] > 0) {
				throw new Error("This question has already a correct answer");
			} else {
				this[correctAnswerCount]++;
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
		this[correctAnswerCount]--;
		super.removeAnswerOption(index);
	}
}
