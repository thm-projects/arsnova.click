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
import {Router} from 'meteor/iron:router';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {ResponsesCollection} from '/lib/responses/collection.js';
import {MemberListCollection} from '/lib/member_list/collection.js';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {SessionConfigurationCollection} from '/lib/session_configuration/collection.js';
import * as localData from '/lib/local_storage.js';
import * as liveResultsLib from "/client/layout/view_live_results/scripts/lib.js";
import {ErrorSplashscreen, showReadingConfirmationSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import {globalEventStackObserver} from '/client/plugins/event_stack_observer/scripts/lib.js';
import {hasTHMMail} from "/client/layout/view_choose_nickname/scripts/lib";

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
		"EventManagerCollection.startQuiz"
	], function (key, value) {
		if (!isNaN(value.sessionStatus)) {
			if (value.sessionStatus === 3) {
				if (localData.containsHashtag(Router.current().params.quizName) || SessionConfigurationCollection.findOne({hashtag: Router.current().params.quizName}).readingConfirmationEnabled) {
					Router.go("/" + Router.current().params.quizName + "/results");
				} else {
					Router.go("/" + Router.current().params.quizName + "/onpolling");
				}
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
		"SessionConfiguration.setTheme", "SessionConfiguration.setConfig"
	], function (key, value) {
		if (value.theme) {
			sessionStorage.setItem("quizTheme", value.theme);
			Session.set("theme", value.theme);
		}
	});

	globalEventStackObserver.onChange([
		"SessionConfiguration.setNicks", "SessionConfiguration.setConfig"
	], function (key, value) {
		if (value.nicks.restrictToCASLogin && !Meteor.user()) {
			Meteor.loginWithCas(function () {
				if (!hasTHMMail()) {
					Router.go("/" + Router.current().params.quizName + "/resetToHome");
				}
				Meteor.call('MemberListCollection.setLearnerReference', {
					hashtag: Router.current().params.quizName,
					nick: localStorage.getItem(Router.current().params.quizName + "nick"),
					userRef: Meteor.user()._id
				});
			});
		} else if (!value.nicks.restrictToCASLogin) {
			Meteor.logout();
			Meteor.call('MemberListCollection.setLearnerReference', {
				hashtag: Router.current().params.quizName,
				nick: localStorage.getItem(Router.current().params.quizName + "nick"),
				userRef: ""
			});
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
				const questionElement = QuestionGroupCollection.findOne().questionList[value.questionIndex];
				const isReadingConfirmationEnabled = SessionConfigurationCollection.findOne({hashtag: Router.current().params.quizName}).readingConfirmationEnabled;
				if (isReadingConfirmationEnabled &&
					(questionElement.type === "RangedQuestion" || questionElement.type === "FreeTextQuestion")) {
					return;
				}
				Session.set("countdownInitialized", true);
				liveResultsLib.displayQuestionAndAnswerDialog(value.questionIndex);
				setTimeout(function () {
					const dialog = liveResultsLib.getQuestionDialog();
					if (dialog) {
						dialog.close();
					}
				}, questionElement.timer * 0.75 * 1000);
			} else {
				Router.go("/" + Router.current().params.quizName + "/onpolling");
			}
		}
	});

	globalEventStackObserver.onChange([
		"EventManagerCollection.showReadConfirmedForIndex"
	], function (key, value) {
		if (!isNaN(value.readingConfirmationIndex) &&
			value.readingConfirmationIndex > -1 &&
			SessionConfigurationCollection.findOne({hashtag: Router.current().params.quizName}).readingConfirmationEnabled !== false) {
			showReadingConfirmationSplashscreen(value.readingConfirmationIndex);
		}
	});

	globalEventStackObserver.onChange([
		"ResponsesCollection.addResponse"
	], function () {
		let allMemberResponses = ResponsesCollection.find({questionIndex: EventManagerCollection.findOne().questionIndex}).fetch();
		let memberWithGivenResponsesAmount = _.uniq(allMemberResponses, false, function (user) {
			return user.userNick;
		}).length;
		let memberAmount = MemberListCollection.find().fetch().length;
		if (memberWithGivenResponsesAmount >= memberAmount) {
			liveResultsLib.countdownFinish();
		}
	});
}

function addVotingViewChangeEvents() {
	globalEventStackObserver.onChange([
		"EventManagerCollection.setSessionStatus"
	], function (key, value) {
		if (!isNaN(value.sessionStatus) && value.sessionStatus === 2) {
			$('.modal-backdrop').remove();
			Router.go("/" + Router.current().params.quizName + "/memberlist");
		}
	});
}

export function getChangeEventsForRoute(route) {
	if (typeof route === "undefined" || !route.startsWith(":quizName.") || !globalEventStackObserver || !globalEventStackObserver.isRunning()) {
		return;
	}
	route = route.replace(/(:quizName.)*(.:id)*/g, "");

	switch (route) {
		case "memberlist":
			addMemberlistChangeEvents();
			break;
		case "results":
			addLiveresultsChangeEvents();
			break;
		case "onpolling":
			addVotingViewChangeEvents();
			break;
		case "leaderBoard":
			addLiveresultsChangeEvents();
			break;
		default:
			break;
	}
	addDefaultChangeEvents();
}
