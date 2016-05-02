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

import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {TAPi18n} from 'meteor/tap:i18n';
import {QuestionGroup} from '/lib/questions.js';
import {EventManager} from '/lib/eventmanager.js';
import {mathjaxMarkdown} from '/client/lib/mathjax_markdown.js';
import {ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import * as localData from '/client/lib/local_storage.js';

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

export var subscriptionHandler = null;

export function addQuestion(index) {
	var questionText = $('#questionText').val();
	Meteor.call("QuestionGroup.addQuestion", {
		privateKey: localData.getPrivateKey(),
		hashtag: Session.get("hashtag"),
		questionIndex: index,
		questionText: questionText
	}, (err) => {
		if (err) {
			new ErrorSplashscreen({
				autostart: true,
				errorMessage: TAPi18n.__("plugins.splashscreen.error.error_messages." + err.reason)
			});
		} else {
			localData.addQuestion(Session.get("hashtag"), index, questionText);
		}
	});
}

export function calculateWindow() {
	var hashtagLength = Session.get("hashtag").length;
	var headerTitel = $(".header-titel");
	var fontSize = "";
	var marginTopModifier = 0;

	if (hashtagLength <= 10) {
		if ($(document).width() < 1200) {
			fontSize = "6vw";
			marginTopModifier = 0.1;
		} else {
			fontSize = "5vw";
			marginTopModifier = 0.2;
		}
	} else if (hashtagLength > 10 && hashtagLength <= 15) {
		fontSize = "4vw";
		marginTopModifier = 0.4;
	} else {
		fontSize = "2.5vw";
		marginTopModifier = 0.6;
	}

	headerTitel.css("font-size", fontSize);
	headerTitel.css("margin-top", $(".arsnova-logo").height() * marginTopModifier);
}

export function changePreviewButtonText(text) {
	$('#formatPreviewText').text(text);

	if (text === TAPi18n.__("view.questions.preview")) {
		$('#formatPreviewGlyphicon').removeClass("glyphicon-cog").addClass("glyphicon-phone");
		$('#markdownBarDiv').removeClass('hide');
		$('#questionText').removeClass('round-corners').addClass('round-corners-markdown');
	} else {
		$('#formatPreviewGlyphicon').removeClass("glyphicon-phone").addClass("glyphicon-cog");
		$('#markdownBarDiv').addClass('hide');
		$('#questionText').removeClass('round-corners-markdown').addClass('round-corners');
	}
}

export function checkForMarkdown() {
	if (EventManager.findOne().questionIndex < 0) {
		return;
	}
	var questionText = QuestionGroup.findOne().questionList[EventManager.findOne().questionIndex].questionText;
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
