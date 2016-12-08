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
import {Template} from 'meteor/templating';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {AnswerOptionCollection} from '/lib/answeroptions/collection.js';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {mathjaxMarkdown} from '/client/lib/mathjax_markdown.js';
import {markdownTracker} from '/client/lib/mathjax_markdown.js';
import {Splashscreen} from "/client/plugins/splashscreen/scripts/lib.js";
import {makeAndSendResponse, makeAndSendRangedResponse, makeAndSendFreeTextResponse, countdownFinish} from './lib.js';

Template.votingview.events({
	'click #js-btn-showQuestionAndAnswerModal': function (event, template) {
		event.stopPropagation();
		const questionDoc = QuestionGroupCollection.findOne();
		if (!questionDoc || template.data["data-questionIndex"]) {
			return;
		}

		mathjaxMarkdown.initializeMarkdownAndLatex();
		let questionContent = mathjaxMarkdown.getContent(questionDoc.questionList[EventManagerCollection.findOne().questionIndex].questionText);
		let answerContent = "";

		let hasEmptyAnswers = true;

		if (questionDoc.questionList[EventManagerCollection.findOne().questionIndex].type !== "FreeTextQuestion") {
			AnswerOptionCollection.find({questionIndex: EventManagerCollection.findOne().questionIndex}, {sort: {answerOptionNumber: 1}}).forEach(function (answerOption) {
				if (!answerOption.answerText) {
					answerOption.answerText = "";
				} else {
					hasEmptyAnswers = false;
				}

				answerContent += "<strong>" + String.fromCharCode((answerOption.answerOptionNumber + 65)) + "</strong>" + "<br/>";
				answerContent += mathjaxMarkdown.getContent(answerOption.answerText);
			});
		}

		if (hasEmptyAnswers) {
			answerContent = "";
			$('#answerOptionsHeader').hide();
		}

		new Splashscreen({
			autostart: true,
			templateName: 'questionAndAnswerSplashscreen',
			closeOnButton: '#js-btn-hideQuestionModal, .splashscreen-container-close',
			instanceId: "questionAndAnswers_" + EventManagerCollection.findOne().questionIndex,
			onRendered: function (instance) {
				instance.templateSelector.find('#questionContent').html(questionContent);
				mathjaxMarkdown.addSyntaxHighlightLineNumbers(instance.templateSelector.find('#questionContent'));
				instance.templateSelector.find('#answerContent').html(answerContent);
				mathjaxMarkdown.addSyntaxHighlightLineNumbers(instance.templateSelector.find('#answerContent'));
			}
		});
	},
	"click #forwardButton": function (event, template) {
		event.stopPropagation();
		if (Session.get("hasSendResponse") || template.data["data-questionIndex"]) {
			return;
		}

		Session.set("hasSendResponse", true);
		const responseArr = JSON.parse(Session.get("responses"));
		if (responseArr.length === 0) {
			const rangeInputField = $("#rangeInput");
			if (rangeInputField.length > 0) {
				if (rangeInputField.val().length === 0 || isNaN(parseFloat(rangeInputField.val()))) {
					return;
				}
				makeAndSendRangedResponse(parseFloat(rangeInputField.val()));
			}
		} else {
			const freeTextInputField = $("#answerTextArea");
			if (freeTextInputField.length > 0) {
				if (freeTextInputField.val().length === 0) {
					return;
				}
				makeAndSendFreeTextResponse(freeTextInputField.val());
			} else {
				makeAndSendResponse(responseArr);
			}
		}
		if (EventManagerCollection.findOne().questionIndex + 1 >= QuestionGroupCollection.findOne().questionList.length) {
			Session.set("sessionClosed", true);
		}
		countdownFinish();
	},
	"DOMSubtreeModified .sendResponse": function (event) {
		const id = $(event.currentTarget).attr("id");
		$('#' + id).removeClass("quickfitSet");
		markdownTracker.changed();
	},
	"click .sendResponse": function (event, template) {
		event.stopPropagation();
		if (template.data["data-questionIndex"]) {
			return;
		}

		const responseArr = JSON.parse(Session.get("responses"));
		const currentId = event.currentTarget.id;
		responseArr[currentId] = !responseArr[currentId];
		if (Session.get("questionSC")) {
			makeAndSendResponse(responseArr);
			countdownFinish();
			return;
		}
		Session.set("responses", JSON.stringify(responseArr));
		Session.set("hasToggledResponse", JSON.stringify(responseArr).indexOf("true") > -1);
		$(event.target).toggleClass("answer-selected");
	},
	"keydown #rangeInput": function (event, template) {
		if (template.data["data-questionIndex"]) {
			return;
		}
		if ($(event.currentTarget).val().length > 0 && !isNaN(parseFloat($(event.currentTarget).val()))) {
			Session.set("hasToggledResponse", true);
			if (event.keyCode === 13) {
				$('#forwardButton').click();
			}
		} else {
			Session.set("hasToggledResponse", false);
		}
	},
	"input #answerTextArea": function (event, template) {
		if (template.data["data-questionIndex"]) {
			return;
		}
		Session.set("hasToggledResponse", $(event.currentTarget).val().length > 0);
	}
});
