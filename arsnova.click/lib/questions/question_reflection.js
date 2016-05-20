
import {SingleChoiceQuestion} from "./question_choice_single.js";
import {MultipleChoiceQuestion} from "./question_choice_multiple.js";
import {RangedQuestion} from "./question_ranged.js";
import {SurveyQuestion} from "./question_survey.js";

export const questionReflection = {
	SingleChoiceQuestion: function (options) {
		return new SingleChoiceQuestion(options);
	},
	MultipleChoiceQuestion: function (options) {
		return new MultipleChoiceQuestion(options);
	},
	SurveyQuestion: function (options) {
		return new SurveyQuestion(options);
	},
	RangedQuestion: function (options) {
		return new RangedQuestion(options);
	}
};


