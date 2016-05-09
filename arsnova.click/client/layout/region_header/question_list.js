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
import {Tracker} from 'meteor/tracker';
import {TAPi18n} from 'meteor/tap:i18n';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import * as questionLib from '/client/layout/view_questions/scripts/lib.js';
import * as localData from '/client/lib/local_storage.js';
import * as lib from './lib.js';

var redirectTracker = null;

Template.questionList.onCreated(function () {
	Meteor.call("EventManagerCollection.setActiveQuestion", Router.current().params.quizName, 0);
	Session.set("validQuestions", []);

	localData.reenterSession(Router.current().params.quizName);
	if (!QuestionGroupCollection.findOne()) {
		return;
	}


	var questionList = QuestionGroupCollection.findOne().questionList;
	var validQuestions = Session.get("validQuestions");
	if (questionList.length >= validQuestions.length) {
		return;
	}

	validQuestions.splice(questionList.length - 1, validQuestions.length - questionList.length);

	Session.set("validQuestions", validQuestions);
});

Template.questionList.onDestroyed(function () {
	if (redirectTracker) {
		redirectTracker.stop();
	}
	delete Session.keys.validQuestions;
});

Template.questionList.onRendered(function () {
	let handleRedirect = true;
	redirectTracker = Tracker.autorun(function () {
		let validQuestions = Session.get("validQuestions");
		if (!validQuestions || validQuestions.length === 0) {
			return;
		}

		let allValid = true;
		for (var i = 0; i < validQuestions.length; i++) {
			if (validQuestions[i] !== true) {
				allValid = false;
				break;
			}
		}
		if (!Session.get("overrideValidQuestionRedirect")) {
			delete Session.keys.overrideValidQuestionRedirect;
			handleRedirect = false;
			if (redirectTracker) {
				redirectTracker.stop();
			}
		} else {
			if (allValid && handleRedirect) {
				delete Session.keys.overrideValidQuestionRedirect;
				Meteor.call("MemberListCollection.removeFromSession", Router.current().params.quizName);
				Meteor.call("EventManagerCollection.setActiveQuestion", Router.current().params.quizName, 0);
				Meteor.call("EventManagerCollection.setSessionStatus", Router.current().params.quizName, 2);
				Router.go("/" + Router.current().params.quizName + "/memberlist");
			}
		}
	});
});

Template.questionList.helpers({
	question: function () {
		var doc = QuestionGroupCollection.findOne();
		return doc ? doc.questionList : false;
	},
	getNormalizedIndex: function (index) {
		return index + 1;
	},
	isActiveIndex: function (index) {
		return index === EventManagerCollection.findOne().questionIndex;
	},
	hasCompleteContent: function (index) {
		var validQuestions = Session.get("validQuestions");
		validQuestions[index] = lib.checkForValidQuestions(index);
		Session.set("validQuestions", validQuestions);
		return validQuestions[index];
	}
});

Template.questionList.events({
	'click .questionIcon:not(.active)': function (event) {
		Meteor.call("EventManagerCollection.setActiveQuestion", Router.current().params.quizName, parseInt($(event.target).closest(".questionIcon").attr("id").replace("questionIcon_", "")), function () {
			questionLib.checkForMarkdown();
			questionLib.checkForValidQuestiontext();
		});
	},
	'click .removeQuestion': function (event) {
		var id = parseInt($(event.target).closest(".questionIcon").attr("id").replace("questionIcon_", ""));
		var validQuestions = Session.get("validQuestions");
		validQuestions.splice(id, 1);
		if (id > 0) {
			Meteor.call("EventManagerCollection.setActiveQuestion", Router.current().params.quizName, (id - 1));
			validQuestions.push(false);
		}

		Meteor.call('AnswerOptionCollection.deleteOption', {
			hashtag: Router.current().params.quizName,
			questionIndex: id,
			answerOptionNumber: -1
		}, (err) => {
			if (err) {
				new ErrorSplashscreen({
					autostart: true,
					errorMessage: TAPi18n.__("plugins.splashscreen.error.error_messages." + err.reason)
				});
			} else {
				Meteor.call("QuestionGroupCollection.removeQuestion", {
					hashtag: Router.current().params.quizName,
					questionIndex: id
				}, (err) => {
					if (err) {
						new ErrorSplashscreen({
							autostart: true,
							errorMessage: TAPi18n.__("plugins.splashscreen.error.error_messages." + err.reason)
						});
					} else {
						localData.removeQuestion(Router.current().params.quizName, id);
						if (QuestionGroupCollection.findOne().questionList.length === 0) {
							lib.addNewQuestion(questionLib.checkForMarkdown);
							validQuestions.push(false);
						} else {
							questionLib.checkForMarkdown();
						}
						Session.set("validQuestions", validQuestions);
					}
				});
			}
		});
	},
	'click #addQuestion': function () {
		lib.addNewQuestion(questionLib.checkForMarkdown);
		setTimeout(()=> {
			let scrollPane = $(".questionScrollPane");
			scrollPane.scrollLeft(scrollPane.width());
		}, 200);
	}
});
