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
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {MemberListCollection} from '/lib/member_list/collection.js';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {ResponsesCollection} from '/lib/responses/collection.js';
import {ErrorSplashscreen, Splashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import {calculateButtonCount, startCountdown, displayQuestionAndAnswerDialog} from './lib.js';

Template.liveResults.events({
	'click #js-btn-showQuestionAndAnswerModal': function (event) {
		event.stopPropagation();
		displayQuestionAndAnswerDialog(parseInt($(event.currentTarget).parents(".question-row").attr("id").replace("question-row_", "")));
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

Template.liveResultsFooterNavButtons.events({
	'click #backButton': (event)=> {
		event.stopPropagation();
		const returnToLobby = function () {
			$('.sound-button').show();
			console.log(EventManagerCollection.findOne());
			Meteor.call("EventManagerCollection.setSessionStatus", Router.current().params.quizName, 2, function () {
				console.log(EventManagerCollection.findOne());
				Meteor.call('ResponsesCollection.clearAll', Router.current().params.quizName);
				Meteor.call("MemberListCollection.clearReadConfirmed", Router.current().params.quizName);
			});
		};
		if (ResponsesCollection.findOne()) {
			new Splashscreen({
				autostart: true,
				templateName: 'returnToLobbySplashscreen',
				closeOnButton: '#closeDialogButton, #returnToLobby, .splashscreen-container-close',
				onRendered: function (template) {
					template.templateSelector.find("#returnToLobby").on("click", function () {
						returnToLobby();
					});
				}
			});
		} else {
			returnToLobby();
		}
	},
	'click #startNextQuestion': (event)=> {
		event.stopPropagation();

		var questionDoc = QuestionGroupCollection.findOne();
		if (!questionDoc) {
			return;
		}
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
				return;
			}
			Session.set("sessionClosed", false);
			startCountdown(EventManagerCollection.findOne().questionIndex + 1);
		});
	},
	'click #goGlobalRanking': (event)=> {
		event.stopPropagation();
		Router.go("/" + Router.current().params.quizName + "/leaderBoard/all");
	},
	'click #showNextQuestionDialog': (event)=> {
		event.stopPropagation();
		Meteor.call("EventManagerCollection.showReadConfirmedForIndex", Router.current().params.quizName, EventManagerCollection.findOne().questionIndex + 1);
	}
});
