import {EJSON} from 'meteor/ejson';
import {AbstractQuestion} from './question_abstract.js';

export class SurveyQuestion extends AbstractQuestion {

	constructor (options) {
		super(options);
	}

	isValid () {
		let hasValidAnswer = 0;
		this.getAnswerOptionList().forEach(function (answeroption) {
			if (answeroption.getIsCorrect()) {
				hasValidAnswer++;
			}
		});
		return super.isValid() && hasValidAnswer === 0;
	}

	clone () {
		return new SurveyQuestion(this.serialize());
	}
}

EJSON.addType("SurveyQuestion", function (value) {
	return new SurveyQuestion(value);
});
