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
import {EventManager} from '/lib/eventmanager.js';
import {AnswerOptions} from '/lib/answeroptions.js';
import {MemberList} from '/lib/memberlist.js';
import {QuestionGroup} from '/lib/questions.js';
import {mathjaxMarkdown} from '/client/lib/mathjax_markdown.js';
import * as localData from '/client/lib/local_storage.js';
import {ErrorSplashscreen, Splashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import {calculateButtonCount, startCountdown} from './lib.js';

Template.liveResults.events({
	'click #js-btn-showQuestionAndAnswerModal': function (event) {
		event.stopPropagation();
		var questionDoc = QuestionGroup.findOne();
		if (!questionDoc) {
			return;
		}

		mathjaxMarkdown.initializeMarkdownAndLatex();
		var targetId = parseInt($(event.currentTarget).parents(".question-row").attr("id").replace("question-row_", ""));
		var answerContent = "";
		let questionContent = mathjaxMarkdown.getContent(questionDoc.questionList[EventManager.findOne().questionIndex].questionText);

		let hasEmptyAnswers = true;

		AnswerOptions.find({questionIndex: targetId}, {sort: {answerOptionNumber: 1}}).forEach(function (answerOption) {
			if (!answerOption.answerText) {
				answerOption.answerText = "";
			} else {
				hasEmptyAnswers = false;
			}

			answerContent += String.fromCharCode((answerOption.answerOptionNumber + 65)) + "<br/>";
			answerContent += mathjaxMarkdown.getContent(answerOption.answerText) + "<br/>";
		});

		if (hasEmptyAnswers) {
			answerContent = "";
			$('#answerOptionsHeader').hide();
		}

		new Splashscreen({
			autostart: true,
			templateName: 'questionAndAnswerSplashscreen',
			closeOnButton: '#js-btn-hideQuestionModal',
			instanceId: "questionAndAnswers_" + EventManager.findOne().questionIndex,
			onRendered: function (instance) {
				instance.templateSelector.find('#questionContent').html(questionContent);
				instance.templateSelector.find('#answerContent').html(answerContent);
			}
		});
	},
	"click .btn-showLeaderBoard": function (event) {
		event.stopPropagation();
		var targetId = parseInt($(event.currentTarget).attr("id").replace("js-btn-showLeaderBoard_", ""));
		Session.set("showLeaderBoardId", targetId);
		Router.go("/statistics");
	},
	"click #js-btn-export": function (event) {
		event.stopPropagation();
		Meteor.call('Hashtags.export', {
			hashtag: Session.get("hashtag"),
			privateKey: localData.getPrivateKey()
		}, (err, res) => {
			if (err) {
				new ErrorSplashscreen({
					autostart: true,
					errorMessage: TAPi18n.__("plugins.splashscreen.error.error_messages.export_failed") + err.reason
				});
			} else {
				var exportData = "text/json;charset=utf-8," + encodeURIComponent(res);
				var a = document.createElement('a');
				var time = new Date();
				var timestring = time.getDate() + "_" + (time.getMonth() + 1) + "_" + time.getFullYear();
				a.href = 'data:' + exportData;
				a.download = Session.get("hashtag") + "-" + timestring + ".json";
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
		Meteor.call('Responses.clearAll', localData.getPrivateKey(), Session.get("hashtag"));
		Meteor.call("MemberList.clearReadConfirmed", localData.getPrivateKey(), Session.get("hashtag"));
		Meteor.call("EventManager.setSessionStatus", localData.getPrivateKey(), Session.get("hashtag"), 2);
	},
	'click #startNextQuestion': (event)=> {
		event.stopPropagation();

		var questionDoc = QuestionGroup.findOne();
		if (!questionDoc) {
			return;
		}

		Meteor.call('Question.startTimer', {
			privateKey: localData.getPrivateKey(),
			hashtag: Session.get("hashtag"),
			questionIndex: EventManager.findOne().questionIndex + 1
		}, (err) => {
			if (err) {
				new ErrorSplashscreen({
					autostart: true,
					errorMessage: TAPi18n.__("plugins.splashscreen.error.error_messages." + err.reason)
				});
				Session.set("sessionClosed", true);
			} else {
				startCountdown(EventManager.findOne().questionIndex + 1);
			}
		});
	},
	'click #goGlobalRanking': (event)=> {
		event.stopPropagation();
		Session.set("showLeaderBoardId", undefined);
		Session.set("showGlobalRanking", true);
		Router.go("/statistics");
	},
	'click #showNextQuestionDialog': (event)=> {
		event.stopPropagation();
		Meteor.call("EventManager.showReadConfirmedForIndex", localData.getPrivateKey(), Session.get("hashtag"), EventManager.findOne().questionIndex + 1);
	},
	"click .btn-more-learners": function () {
		Session.set("LearnerCount", MemberList.find().count());
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
