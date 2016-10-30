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
import {TAPi18n} from 'meteor/tap:i18n';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {AnswerOptionCollection} from '/lib/answeroptions/collection.js';
import {MemberListCollection} from '/lib/member_list/collection.js';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {mathjaxMarkdown} from '/client/lib/mathjax_markdown.js';
import {ErrorSplashscreen, Splashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import {calculateHeaderSize} from '/client/layout/region_header/lib.js';
import {calculateButtonCount, startCountdown, isCountdownZero, setQuestionDialog} from './lib.js';

Template.liveResults.events({
	'click #js-btn-showQuestionAndAnswerModal': function (event) {
		event.stopPropagation();
		var questionDoc = QuestionGroupCollection.findOne();
		if (!questionDoc) {
			return;
		}

		mathjaxMarkdown.initializeMarkdownAndLatex();
		var targetId = parseInt($(event.currentTarget).parents(".question-row").attr("id").replace("question-row_", ""));
		var answerContent = "";
		const questionElement = questionDoc.questionList[targetId];
		let questionContent = mathjaxMarkdown.getContent(questionElement.questionText);

		let hasEmptyAnswers = true;

		if (questionElement.type === "RangedQuestion" && isCountdownZero(targetId)) {
			hasEmptyAnswers = false;
			answerContent += TAPi18n.__("view.answeroptions.ranged_question.min_range") + ": " + questionElement.rangeMin + "<br/>";
			answerContent += TAPi18n.__("view.answeroptions.ranged_question.max_range") + ": " + questionElement.rangeMax + "<br/><br/>";
			answerContent += TAPi18n.__("view.answeroptions.ranged_question.correct_value") + ": " + questionElement.correctValue + "<br/>";
		} else {
			if (questionElement.type !== "FreeTextQuestion" || isCountdownZero(targetId)) {
				AnswerOptionCollection.find({questionIndex: targetId}, {sort: {answerOptionNumber: 1}}).forEach(function (answerOption) {
					if (!answerOption.answerText) {
						answerOption.answerText = "";
					} else {
						hasEmptyAnswers = false;
					}

					if (questionElement.type !== "FreeTextQuestion") {
						answerContent += String.fromCharCode((answerOption.answerOptionNumber + 65)) + "<br/>";
					} else {
						answerContent += TAPi18n.__("view.liveResults.correct_answer") + ":<br/>";
					}
					answerContent += mathjaxMarkdown.getContent(answerOption.answerText) + "<br/>";
				});
			}
		}

		if (hasEmptyAnswers) {
			answerContent = "";
			$('#answerOptionsHeader').hide();
		}

		setQuestionDialog(new Splashscreen({
			autostart: true,
			templateName: 'questionAndAnswerSplashscreen',
			closeOnButton: '#js-btn-hideQuestionModal',
			instanceId: "questionAndAnswers_" + targetId,
			onRendered: function (instance) {
				instance.templateSelector.find('#questionContent').html(questionContent);
				mathjaxMarkdown.addSyntaxHighlightLineNumbers(instance.templateSelector.find('#questionContent'));
				instance.templateSelector.find('#answerContent').html(answerContent);
				mathjaxMarkdown.addSyntaxHighlightLineNumbers(instance.templateSelector.find('#answerContent'));
			}
		}));
	},
	"click .btn-showLeaderBoard": function (event) {
		event.stopPropagation();
		var targetId = parseInt($(event.currentTarget).attr("id").replace("js-btn-showLeaderBoard_", ""));
		Router.go("/" + Router.current().params.quizName + "/leaderBoard/" + targetId);
	},
	"click #js-btn-export": function (event) {
		event.stopPropagation();
		Meteor.call('HashtagsCollection.export', {
			hashtag: Router.current().params.quizName
		}, (err, res) => {
			if (err) {
				new ErrorSplashscreen({
					autostart: true,
					errorMessage: "plugins.splashscreen.error.error_messages.export_failed"
				});
			} else {
				var exportData = "text/json;charset=utf-8," + encodeURIComponent(res);
				var a = document.createElement('a');
				var time = new Date();
				var timestring = time.getDate() + "_" + (time.getMonth() + 1) + "_" + time.getFullYear();
				a.href = 'data:' + exportData;
				a.download = Router.current().params.quizName + "-" + timestring + ".json";
				a.innerHTML = '';
				event.target.appendChild(a);
				if (Session.get("exportReady")) {
					Session.set("exportReady", undefined);
				} else {
					Session.set("exportReady", true);
					a.click();
				}
			}
		});
	},
	'click #backButton': (event)=> {
		event.stopPropagation();
		$('.sound-button').show();
		Meteor.call('ResponsesCollection.clearAll', Router.current().params.quizName);
		Meteor.call("MemberListCollection.clearReadConfirmed", Router.current().params.quizName, function () {
			Meteor.call("EventManagerCollection.setSessionStatus", Router.current().params.quizName, 2);
		});
	},
	'click #startNextQuestion': (event)=> {
		event.stopPropagation();

		var questionDoc = QuestionGroupCollection.findOne();
		if (!questionDoc) {
			return;
		}

		calculateHeaderSize();

		Meteor.call('Question.startTimer', {
			hashtag: Router.current().params.quizName,
			questionIndex: EventManagerCollection.findOne().questionIndex + 1
		}, (err) => {
			if (err) {
				new ErrorSplashscreen({
					autostart: true,
					errorMessage: "plugins.splashscreen.error.error_messages." + err.reason
				});
				Session.set("sessionClosed", true);
			} else {
				Session.set("sessionClosed", false);
				startCountdown(EventManagerCollection.findOne().questionIndex + 1);
			}
		});
	},
	'click #goGlobalRanking': (event)=> {
		event.stopPropagation();
		Router.go("/" + Router.current().params.quizName + "/leaderBoard/all");
	},
	'click #showNextQuestionDialog': (event)=> {
		event.stopPropagation();
		Meteor.call("EventManagerCollection.showReadConfirmedForIndex", Router.current().params.quizName, EventManagerCollection.findOne().questionIndex + 1);
	},
	"click .btn-more-learners": function () {
		Session.set("LearnerCount", MemberListCollection.find().count());
		Session.set("LearnerCountOverride", true);
	},
	'click .btn-less-learners': function () {
		Session.set("LearnerCountOverride", false);
		calculateButtonCount();
	},
	'click .btn-learner': function (event) {
		event.preventDefault();
	}
});
