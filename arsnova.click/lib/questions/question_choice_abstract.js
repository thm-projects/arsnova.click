import {AbstractQuestion} from './question_abstract.js';

export class AbstractChoiceQuestion extends AbstractQuestion {

	/**
	 * Constructor super method for creating an AbstractChoiceQuestion instance
	 * This method cannot be invoked directly.
	 * @see AbstractQuestion.constructor()
	 * @param options
	 */
	constructor (options) {
		super(options);
		if (this.constructor === AbstractChoiceQuestion) {
			throw new TypeError("Cannot construct Abstract instances directly");
		}
	}

	/**
	 * Checks if the properties of this instance are valid. Checks also recursively all including AnswerOption instances
	 * and summarizes their result of calling .isValid()
	 * @see AbstractQuestion.isValid()
	 * @returns {boolean} True, if the complete Question instance is valid, False otherwise
	 */
	isValid () {
		let hasValidAnswer = false;
		this.getAnswerOptionList().forEach(function (answeroption) {
			if (answeroption.getIsCorrect()) {
				hasValidAnswer = true;
			}
		});
		return super.isValid() && this.getAnswerOptionList().length > 0 && hasValidAnswer;
	}

	getValidationStackTrace () {
		const parentStackTrace = super.getValidationStackTrace();
		let hasValidAnswer = false;
		this.getAnswerOptionList().forEach(function (answeroption) {
			if (answeroption.getIsCorrect()) {
				hasValidAnswer = true;
			}
		});
		if (!hasValidAnswer) {
			parentStackTrace.push({occuredAt: {type: "question", id: this.getQuestionIndex()}, reason: "no_valid_answers"});
		}
		return parentStackTrace;
	}
}
