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
	const questionType = $('#chooseQuestionType').find('option:selected').attr("id");
	const questionItem = Session.get("questionGroup");

	try {
		new SimpleSchema({
			questionText: questionTextSchema
		}).validate({questionText: questionText});
	} catch (ex) {
		new ErrorSplashscreen({
			autostart: true,
			errorMessage: "plugins.splashscreen.error.error_messages.invalid_input_data"
		});
		return;
	}

	// Check if we need to change the type of the question
	if (questionItem.getQuestionList()[index].typeName() !== questionType) {
		switch (questionItem.getQuestionList()[index].typeName()) {
			case "YesNoSingleChoiceQuestion":
			case "TrueFalseSingleChoiceQuestion":
			case "FreeTextQuestion":
				questionItem.getQuestionList()[index].removeAllAnswerOptions();
				break;
		}
		const serialized = questionItem.getQuestionList()[index].serialize();
		delete serialized.type;
		questionItem.addQuestion(questionReflection[questionType](serialized), index);
		switch (questionType) {
			case "RangedQuestion":
				questionItem.getQuestionList()[index].setTimer(10);
				break;
			case "FreeTextQuestion":
				questionItem.getQuestionList()[index].addDefaultAnswerOption();
				break;
			case "SurveyQuestion":
				questionItem.getQuestionList()[index].getAnswerOptionList().forEach(function (answerOption) {
					answerOption.setIsCorrect(false);
				});
				break;
		}
	}
	questionItem.getQuestionList()[index].setQuestionText(questionText);
	Session.set("questionGroup", questionItem);
	localData.addHashtag(questionItem);
}

export function checkForValidQuestionText() {
	var isValid = Session.get("questionGroup").getQuestionList()[EventManagerCollection.findOne().questionIndex].isValid();
	if (isValid) {
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
			translationName: "view.questions.single_choice_question",
			selected: Session.get("questionGroup").getQuestionList()[EventManagerCollection.findOne().questionIndex].typeName() === "SingleChoiceQuestion" ? 'selected' : ""
		},
		{
			id: "YesNoSingleChoiceQuestion",
			translationName: "view.questions.single_choice_question_yes_no",
			selected: Session.get("questionGroup").getQuestionList()[EventManagerCollection.findOne().questionIndex].typeName() === "YesNoSingleChoiceQuestion" ? 'selected' : ""
		},
		{
			id: "TrueFalseSingleChoiceQuestion",
			translationName: "view.questions.single_choice_question_true_false",
			selected: Session.get("questionGroup").getQuestionList()[EventManagerCollection.findOne().questionIndex].typeName() === "TrueFalseSingleChoiceQuestion" ? 'selected' : ""
		},
		{
			id: "MultipleChoiceQuestion",
			translationName: "view.questions.multiple_choice_question",
			selected: Session.get("questionGroup").getQuestionList()[EventManagerCollection.findOne().questionIndex].typeName() === "MultipleChoiceQuestion" ? 'selected' : ""
		},
		{
			id: "RangedQuestion",
			translationName: "view.questions.ranged_question",
			selected: Session.get("questionGroup").getQuestionList()[EventManagerCollection.findOne().questionIndex].typeName() === "RangedQuestion" ? 'selected' : ""
		},
		{
			id: "FreeTextQuestion",
			translationName: "view.questions.free_text_question",
			selected: Session.get("questionGroup").getQuestionList()[EventManagerCollection.findOne().questionIndex].typeName() === "FreeTextQuestion" ? 'selected' : ""
		},
		{
			id: "SurveyQuestion",
			translationName: "view.questions.survey_question",
			selected: Session.get("questionGroup").getQuestionList()[EventManagerCollection.findOne().questionIndex].typeName() === "SurveyQuestion" ? 'selected' : ""
		}
	];
}
