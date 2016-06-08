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
import {TAPi18n} from 'meteor/tap:i18n';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {questionTextSchema} from '/lib/questions/collection.js';
import {questionReflection} from '/lib/questions/question_reflection.js';
import {mathjaxMarkdown} from '/client/lib/mathjax_markdown.js';
import {ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import * as localData from '/lib/local_storage.js';

function doesMarkdownSyntaxExist(questionText, syntaxStart, syntaxMiddle, syntaxEnd) {
	if (questionText.length <= 0) {
		return false;
	}

	if (questionText.indexOf(syntaxStart) != -1) {
		if (!syntaxMiddle && !syntaxEnd) {
			return true;
		}
	} else {
		return false;
	}

	questionText = questionText.substring(questionText.indexOf(syntaxStart) + syntaxStart.length, questionText.length);

	if (questionText.indexOf(syntaxMiddle) != -1) {
		if (!syntaxEnd) {
			return true;
		}
	} else {
		return false;
	}

	questionText = questionText.substring(questionText.indexOf(syntaxMiddle) + syntaxMiddle.length, questionText.length);

	return questionText.indexOf(syntaxEnd) != -1;
}

function questionContainsMarkdownSyntax(questionText) {
	return !!(doesMarkdownSyntaxExist(questionText, '**', '**') || doesMarkdownSyntaxExist(questionText, '#', '#') || doesMarkdownSyntaxExist(questionText, '[', '](', ')') ||
	doesMarkdownSyntaxExist(questionText, '- ') || doesMarkdownSyntaxExist(questionText, '1. ') || doesMarkdownSyntaxExist(questionText, '\\(', '\\)') ||
	doesMarkdownSyntaxExist(questionText, '$$', '$$') || doesMarkdownSyntaxExist(questionText, '<hlcode>', '</hlcode>') || doesMarkdownSyntaxExist(questionText, '>'));
}

function questionTextLengthWithoutMarkdownSyntax(questionText) {
	var questionTextLength = questionText.length;
	if (doesMarkdownSyntaxExist(questionText, '**', '**')) {
		questionTextLength -= 4;
	}
	if (doesMarkdownSyntaxExist(questionText, '#', '#')) {
		questionTextLength -= 4;
	}
	if (doesMarkdownSyntaxExist(questionText, '[', '](', ')')) {
		questionTextLength -= 4;
	}
	if (doesMarkdownSyntaxExist(questionText, '- ')) {
		questionTextLength -= 4;
	}
	if (doesMarkdownSyntaxExist(questionText, '1. ')) {
		questionTextLength -= 4;
	}
	if (doesMarkdownSyntaxExist(questionText, '\\(', '\\)')) {
		questionTextLength -= 4;
	}
	if (doesMarkdownSyntaxExist(questionText, '$$', '$$')) {
		questionTextLength -= 4;
	}
	if (doesMarkdownSyntaxExist(questionText, '<hlcode>', '</hlcode>')) {
		questionTextLength -= 4;
	}
	if (doesMarkdownSyntaxExist(questionText, '>')) {
		questionTextLength -= 4;
	}
	questionTextLength = questionText.replace(/ /g,"").length;
	return questionTextLength;
}

export var subscriptionHandler = null;

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
	if (questionItem.getQuestionList()[index].constructor.name !== questionType) {
		const serialized = questionItem.getQuestionList()[index].serialize();
		delete serialized.type;
		if (questionType === "RangedQuestion") {
			serialized.timer = "10";
		}
		questionItem.addQuestion(questionReflection[questionType](serialized), index);
		// Check if we changed to the survey question -> remove isCorrect values then
		if (questionType === "SurveyQuestion") {
			questionItem.getQuestionList()[index].getAnswerOptionList().forEach(function (answerOption) {
				answerOption.setIsCorrect(false);
			});
		}
	}
	questionItem.getQuestionList()[index].setQuestionText(questionText);
	Session.set("questionGroup", questionItem);
	localData.addHashtag(questionItem);
}

export function checkForValidQuestionText() {
	var questionText = Session.get("questionGroup").getQuestionList()[EventManagerCollection.findOne().questionIndex].getQuestionText();
	if (questionTextLengthWithoutMarkdownSyntax(questionText) < 5) {
		$('#questionText').addClass("invalidQuestion");
	} else {
		$('#questionText').removeClass("invalidQuestion");
	}
}

export function changePreviewButtonText(text) {
	$('#formatPreviewText').text(text);

	if (text === TAPi18n.__("view.questions.preview")) {
		$('#formatPreviewGlyphicon').removeClass("glyphicon-cog").addClass("glyphicon-phone");
		$('#markdownBarDiv').removeClass('hide');
		$('#questionText').removeClass('round-corners').addClass('round-corners-markdown');
	} else {
		checkForValidQuestionText();
		$('#formatPreviewGlyphicon').removeClass("glyphicon-phone").addClass("glyphicon-cog");
		$('#markdownBarDiv').addClass('hide');
		$('#questionText').removeClass('round-corners-markdown').addClass('round-corners');
	}
}

export function checkForMarkdown() {
	if (EventManagerCollection.findOne().questionIndex < 0) {
		return;
	}
	var questionText = Session.get("questionGroup").getQuestionList()[EventManagerCollection.findOne().questionIndex].getQuestionText();
	if (questionText && questionContainsMarkdownSyntax(questionText)) {
		changePreviewButtonText(TAPi18n.__("view.questions.edit"));

		mathjaxMarkdown.initializeMarkdownAndLatex();

		questionText = mathjaxMarkdown.getContent(questionText);

		$("#questionTextDisplay").html(questionText);
		$('#editQuestionText').hide();
		$('#previewQuestionText').show();
	} else {
		changePreviewButtonText(TAPi18n.__("view.questions.format"));
		$('#previewQuestionText').hide();
		$('#editQuestionText').show();
		if ($(window).width() >= 992) {
			$('#questionText').focus();
		}
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
			id: "SurveyQuestion",
			translationName: "view.questions.survey_question",
			selected: Session.get("questionGroup").getQuestionList()[EventManagerCollection.findOne().questionIndex].typeName() === "SurveyQuestion" ? 'selected' : ""
		}
	];
}
