import {SingleChoiceQuestion} from "./question_choice_single.js";
import {YesNoSingleChoiceQuestion} from "./question_choice_single_yes_no.js";
import {TrueFalseSingleChoiceQuestion} from "./question_choice_single_true_false.js";
import {MultipleChoiceQuestion} from "./question_choice_multiple.js";
import {RangedQuestion} from "./question_ranged.js";
import {SurveyQuestion} from "./question_survey.js";
import {ABCDSingleChoiceQuestion} from "./question_choice_single_abcd.js";
import {FreeTextQuestion} from "./question_freetext.js";

export const questionReflection = {
	SingleChoiceQuestion: function (options) {
		return new SingleChoiceQuestion(options);
	},
	YesNoSingleChoiceQuestion: function (options) {
		return new YesNoSingleChoiceQuestion(options);
	},
	TrueFalseSingleChoiceQuestion: function (options) {
		return new TrueFalseSingleChoiceQuestion(options);
	},
	ABCDSingleChoiceQuestion: function (options) {
		return new ABCDSingleChoiceQuestion(options);
	},
	MultipleChoiceQuestion: function (options) {
		return new MultipleChoiceQuestion(options);
	},
	SurveyQuestion: function (options) {
		return new SurveyQuestion(options);
	},
	RangedQuestion: function (options) {
		return new RangedQuestion(options);
	},
	FreeTextQuestion: function (options) {
		return new FreeTextQuestion(options);
	}
};


