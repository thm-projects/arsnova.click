/*
 * This file is part of ARSnova Click.
 * Copyright (C) 2016 The ARSnova Team
 *
 * ARSnova Click is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Click is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ARSnova Click.  If not, see <http://www.gnu.org/licenses/>.*/

import {Session} from 'meteor/session';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {questionTextSchema} from '/lib/questions/collection.js';
import {questionReflection} from '/lib/questions/question_reflection.js';
import {ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import * as localData from '/lib/local_storage.js';

export function addQuestion(index) {
	const questionText = $('#questionText').val() || "";
	const questionItem = Session.get("questionGroup");
	questionItem.getQuestionList()[index].setQuestionText(questionText);
	Session.set("questionGroup", questionItem);
	localData.addHashtag(questionItem);
}

export function checkForValidQuestionText() {
	const questionTextWithoutMarkdownChars = Session.get("questionGroup").getQuestionList()[Router.current().params.questionIndex].getQuestionTextWithoutMarkdownChars();

	if (questionTextWithoutMarkdownChars > 4 && questionTextWithoutMarkdownChars < 50001) {
		$('#questionText').removeClass("invalidQuestion");
	} else {
		$('#questionText').addClass("invalidQuestion");
	}
}

export function getQuestionTypes() {
	if (!Session.get("questionGroup") || !EventManagerCollection.findOne()) {
		return [];
	}
	return [
		{
			id: "SingleChoiceQuestion",
			translationName: "view.questions.single_choice_question"
		},
		{
			id: "YesNoSingleChoiceQuestion",
			translationName: "view.questions.single_choice_question_yes_no"
		},
		{
			id: "TrueFalseSingleChoiceQuestion",
			translationName: "view.questions.single_choice_question_true_false"
		},
		{
			id: "MultipleChoiceQuestion",
			translationName: "view.questions.multiple_choice_question"
		},
		{
			id: "RangedQuestion",
			translationName: "view.questions.ranged_question"
		},
		{
			id: "FreeTextQuestion",
			translationName: "view.questions.free_text_question"
		},
		{
			id: "SurveyQuestion",
			translationName: "view.questions.survey_question"
		}
	];
}
