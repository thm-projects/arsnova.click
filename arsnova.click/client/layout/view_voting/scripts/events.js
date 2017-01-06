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
import {Template} from 'meteor/templating';
import {Router} from 'meteor/iron:router';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {Splashscreen} from "/client/plugins/splashscreen/scripts/lib.js";
import * as questionLib from '/client/layout/view_questions/scripts/lib.js';
import {makeAndSendResponse, makeAndSendRangedResponse, makeAndSendFreeTextResponse, countdownFinish} from './lib.js';

Template.votingview.events({
	'click #js-btn-showQuestionAndAnswerModal': function (event, template) {
		event.stopPropagation();
		const questionDoc = QuestionGroupCollection.findOne();
		if (!questionDoc || template.data && template.data["data-questionIndex"]) {
			return;
		}
		new Splashscreen({
			autostart: true,
			templateName: 'questionAndAnswerSplashscreen',
			dataContext: {
				questionIndex: EventManagerCollection.findOne().questionIndex,
				revealCorrectValues: false
			},
			closeOnButton: '#js-btn-hideQuestionModal, .splashscreen-container-close',
			instanceId: "questionAndAnswers_" + EventManagerCollection.findOne().questionIndex
		});
	},
	"click #forwardButton": function (event, template) {
		event.stopPropagation();
		if (Session.get("hasSendResponse")) {
			return;
		}

		Session.set("hasSendResponse", true);
		const responseArr = JSON.parse(Session.get("responses"));
		const index = parseInt(Router.current().params.questionIndex) || EventManagerCollection.findOne().questionIndex;
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
				if (template.data && template.data["data-questionIndex"]) {
					if ($('.correctAnswer, .wrongAnswer').length > 0) {
						return;
					}
					Session.get("questionGroup").getQuestionList()[index].getAnswerOptionList().forEach(function (element) {
						if (element.getIsCorrect()) {
							$('#' + element.getAnswerOptionNumber()).addClass("correctAnswer");
						} else {
							$('#' + element.getAnswerOptionNumber()).addClass("wrongAnswer");
						}
					});
					Meteor.setTimeout(function () {
						$('.sendResponse').removeClass("correctAnswer wrongAnswer");
						Session.set("hasSendResponse", false);
					}, 2000);
					return;
				} else {
					makeAndSendResponse(responseArr);
				}
			}
		}
		if (EventManagerCollection.findOne().questionIndex + 1 >= QuestionGroupCollection.findOne().questionList.length) {
			Session.set("sessionClosed", true);
		}
		countdownFinish();
	},
	"click .sendResponse": function (event, template) {
		event.stopPropagation();
		event.preventDefault();
		const index = typeof Router.current().params.questionIndex === "undefined" ? EventManagerCollection.findOne().questionIndex : parseInt(Router.current().params.questionIndex);
		const responseArr = JSON.parse(Session.get("responses"));
		const currentId = event.currentTarget.id;
		responseArr[currentId] = !responseArr[currentId];
		if (Session.get("questionSC")) {
			if (template.data && template.data["data-questionIndex"]) {
				if ($('.correctAnswer, .wrongAnswer').length > 0) {
					return;
				}
				Session.get("questionGroup").getQuestionList()[index].getAnswerOptionList().forEach(function (element) {
					if (element.getIsCorrect()) {
						$('#' + element.getAnswerOptionNumber()).addClass("correctAnswer");
					} else {
						$('#' + element.getAnswerOptionNumber()).addClass("wrongAnswer");
					}
				});
				Meteor.setTimeout(function () {
					$('.sendResponse').removeClass("correctAnswer wrongAnswer");
				}, 2000);
				return;
			} else {
				makeAndSendResponse(responseArr);
				countdownFinish();
				return;
			}
		}
		Session.set("responses", JSON.stringify(responseArr));
		Session.set("hasToggledResponse", JSON.stringify(responseArr).indexOf("true") > -1);
		$(event.currentTarget).toggleClass("answer-selected");
	},
	"DOMSubtreeModified .sendResponse": function (event) {
		const id = $(event.currentTarget).attr("id");
		$('#' + id).removeClass("quickfitSet");
		questionLib.markdownRenderingTracker.changed();
	},
	"keydown #rangeInput": function (event, template) {
		if (template.data && template.data["data-questionIndex"]) {
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
		if (template.data && template.data["data-questionIndex"]) {
			return;
		}
		Session.set("hasToggledResponse", $(event.currentTarget).val().length > 0);
	}
});
