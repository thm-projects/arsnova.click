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
import {AnswerOptionCollection} from '/lib/answeroptions/collection.js';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {ResponsesCollection} from '/lib/responses/collection.js';
import {MemberListCollection} from '/lib/member_list/collection.js';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {SessionConfigurationCollection} from '/lib/session_configuration/collection.js';
import * as localData from '/lib/local_storage.js';
import * as liveResultsLib from "/client/layout/view_live_results/scripts/lib.js";
import * as votingViewLib from "/client/layout/view_voting/scripts/lib.js";
import {mathjaxMarkdown} from '/client/lib/mathjax_markdown.js';
import {Splashscreen, ErrorSplashscreen, showReadingConfirmationSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import {globalEventStackObserver} from '/client/plugins/event_stack_observer/scripts/lib.js';

function addDefaultChangeEvents() {
	globalEventStackObserver.onChange([
		"EventManagerCollection.beforeClear"
	], function () {
		if (!localData.containsHashtag(Router.current().params.quizName)) {
			new ErrorSplashscreen({
				autostart: true,
				errorMessage: "plugins.splashscreen.error.error_messages.session_closed"
			});
		}
		Router.go("/" + Router.current().params.quizName + "/resetToHome");
	});
}

function addMemberlistChangeEvents() {
	globalEventStackObserver.onChange([
		"EventManagerCollection.setSessionStatus"
	], function (key, value) {
		if (!isNaN(value.sessionStatus)) {
			if (value.sessionStatus === 3) {
				Router.go("/" + Router.current().params.quizName + "/results");
			}
		}
	});

	globalEventStackObserver.onChange([
		"MemberListCollection.removeLearner"
	], function (key, value) {
		if (value.user === localStorage.getItem(Router.current().params.quizName + "nick")) {
			new ErrorSplashscreen({
				autostart: true,
				errorMessage: "plugins.splashscreen.error.error_messages.kicked_from_quiz"
			});
			Router.go("/" + Router.current().params.quizName + "/resetToHome");
		}
	});

	globalEventStackObserver.onChange([
		"HashtagsCollection.setDefaultTheme"
	], function (key, value) {
		if (value.theme) {
			sessionStorage.setItem("quizTheme", value.theme);
			Session.set("theme", value.theme);
		}
	});
}

function addLiveresultsChangeEvents() {
	globalEventStackObserver.onChange([
		"EventManagerCollection.setSessionStatus"
	], function (key, value) {
		if (!isNaN(value.sessionStatus) && value.sessionStatus === 2) {
			$('.modal-backdrop').remove();
			Router.go("/" + Router.current().params.quizName + "/memberlist");
		}
	});

	globalEventStackObserver.onChange([
		"EventManagerCollection.setActiveQuestion"
	], function (key, value) {
		if (!isNaN(value.questionIndex) && value.questionIndex !== -1) {
			if (localData.containsHashtag(Router.current().params.quizName)) {
				new Splashscreen({
					autostart: true,
					instanceId: "answers_" + value.questionIndex,
					templateName: 'questionAndAnswerSplashscreen',
					closeOnButton: '#js-btn-hideQuestionModal',
					onRendered: function (instance) {
						var answerContent = "";
						var questionContent = "";
						const questionElement = QuestionGroupCollection.findOne().questionList[value.questionIndex];
						mathjaxMarkdown.initializeMarkdownAndLatex();
						if (SessionConfigurationCollection.findOne({hashtag: Router.current().params.quizName}).readingConfirmationEnabled === false) {
							var questionDoc = QuestionGroupCollection.findOne({hashtag: Router.current().params.quizName});
							if (questionDoc) {
								questionContent = mathjaxMarkdown.getContent(questionDoc.questionList[value.questionIndex].questionText);
							}
						}
						if (questionElement.type !== "RangedQuestion" && questionElement.type !== "FreeTextQuestion") {
							AnswerOptionCollection.find({questionIndex: value.questionIndex}, {sort: {answerOptionNumber: 1}}).forEach(function (answerOption) {
								if (!answerOption.answerText) {
									answerOption.answerText = "";
								}

								answerContent += String.fromCharCode((answerOption.answerOptionNumber + 65)) + "<br/>";
								answerContent += mathjaxMarkdown.getContent(answerOption.answerText) + "<br/>";
							});
						}

						instance.templateSelector.find('#questionContent').html(questionContent);
						mathjaxMarkdown.addSyntaxHighlightLineNumbers(instance.templateSelector.find('#questionContent'));
						instance.templateSelector.find('#answerContent').html(answerContent);
						mathjaxMarkdown.addSyntaxHighlightLineNumbers(instance.templateSelector.find('#answerContent'));
						setTimeout(function () {
							instance.close();
						}, questionElement.timer * 0.75 * 1000);
					}
				});
				/*
				if (value.questionIndex + 1 >= QuestionGroupCollection.findOne().questionList.length) {
					footerElements.removeFooterElement(footerElements.footerElemReadingConfirmation);
				} else {
					footerElements.addFooterElement(footerElements.footerElemReadingConfirmation, 2);
				}
				footerElements.calculateFooter();
				*/
			} else {
				Router.go("/" + Router.current().params.quizName + "/onpolling");
			}
		}
	});

	globalEventStackObserver.onChange([
		"EventManagerCollection.showReadConfirmedForIndex"
	], function (key, value) {
		if (!isNaN(value.readingConfirmationIndex) &&
			value.readingConfirmationIndex > 0 &&
			SessionConfigurationCollection.findOne({hashtag: Router.current().params.quizName}).readingConfirmationEnabled !== false) {
			showReadingConfirmationSplashscreen(value.readingConfirmationIndex);
		}
	});
}

function addOnPollingChangeEvents() {
	globalEventStackObserver.onChange([
		"ResponsesCollection.addResponse"
	], function () {
		let allMemberResponses = ResponsesCollection.find({questionIndex: EventManagerCollection.findOne().questionIndex}).fetch();
		let memberWithGivenResponsesAmount = _.uniq(allMemberResponses, false, function (user) {
			return user.userNick;
		}).length;
		let memberAmount = MemberListCollection.find().count();
		if (memberWithGivenResponsesAmount === memberAmount) {
			if (localData.containsHashtag(Router.current().params.quizName)) {
				liveResultsLib.countdownFinish();
			} else {
				votingViewLib.countdownFinish();
			}
		}
	});
}

export function getChangeEventsForRoute(route) {
	if (typeof route === "undefined" || !route.startsWith(":quizName.") || !globalEventStackObserver || !globalEventStackObserver.isRunning()) {
		return;
	}
	route = route.replace(":quizName.", "");

	switch (route) {
		case "memberlist":
			addMemberlistChangeEvents();
			break;
		case "results":
			addOnPollingChangeEvents();
			addLiveresultsChangeEvents();
			break;
		case "statistics":
			addLiveresultsChangeEvents();
			break;
		case "globalLeaderBoard":
			addLiveresultsChangeEvents();
			break;
		default:
			break;
	}
	addDefaultChangeEvents();
}
