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
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';

export let countdown = null;
export let currentButton = 0;
export let countdownRunning = false;
let questionIndex = -1;

export function deleteCountdown() {
	countdown = null;
	countdownRunning = false;
}

export function countdownFinish() {
	if (Session.get("countdownInitialized") && countdownRunning) {
		deleteCountdown();
		if (questionIndex + 1 >= QuestionGroupCollection.findOne().questionList.length) {
			Session.set("sessionClosed", true);
		}
		Session.set("countdownInitialized", false);
		Router.go("/" + Router.current().params.quizName + "/results");
		countdownRunning = false;
	}
}

export function startCountdown(index) {
	questionIndex = index;
	Session.set("hasSendResponse", false);
	Session.set("hasToggledResponse", false);

	countdownRunning = true;

	Meteor.call('Question.isSC', {
		hashtag: Router.current().params.quizName,
		questionIndex: EventManagerCollection.findOne().questionIndex
	}, (err, res) => {
		if (!err && res) {
			Session.set("questionSC", res);
		}
	});

	var questionDoc = QuestionGroupCollection.findOne().questionList[index];
	Session.set("sessionCountDown", questionDoc.timer);
	countdown = new ReactiveCountdown(questionDoc.timer, {
		tick: function () {
			var buttonsCount = $('.answer-row').children().length;
			var lastButton = 0;
			var secondsUntilNextRound = 3;

			if (currentButton <= 0) {
				lastButton = buttonsCount - 1;
			} else {
				lastButton = currentButton - 1;
			}

			/* skip the selected answer options */
			while ($('#' + currentButton).hasClass('answer-selected')) {
				currentButton++;
				if (currentButton >= buttonsCount) {
					currentButton = 0 - secondsUntilNextRound;
				}
			}

			$('#' + lastButton).removeClass('button-green-transition').addClass('button-purple-transition');
			$('#' + currentButton).addClass('button-green-transition').removeClass('button-purple-transition');

			currentButton++;

			if (currentButton >= buttonsCount) {
				currentButton = 0 - secondsUntilNextRound;
			}
		}
	});
	countdown.start(function () {
		countdownFinish();
	});
	Session.set("countdownInitialized", true);
}

export function makeAndSendResponse(answerOptionNumber) {
	Meteor.call('ResponsesCollection.addResponse', {
		hashtag: Router.current().params.quizName,
		questionIndex: EventManagerCollection.findOne().questionIndex,
		answerOptionNumber: Number(answerOptionNumber),
		userNick: localStorage.getItem(Router.current().params.quizName + "nick")
	}, (err) => {
		if (err) {
			new ErrorSplashscreen({
				autostart: true,
				errorMessage: TAPi18n.__("plugins.splashscreen.error.error_messages." + err.reason)
			});
		}
	});
}

export function makeAndSendRangedResponse(value) {
	Meteor.call('ResponsesCollection.addResponse', {
		hashtag: Router.current().params.quizName,
		questionIndex: EventManagerCollection.findOne().questionIndex,
		inputValue: value,
		userNick: localStorage.getItem(Router.current().params.quizName + "nick")
	}, (err) => {
		if (err) {
			new ErrorSplashscreen({
				autostart: true,
				errorMessage: TAPi18n.__("plugins.splashscreen.error.error_messages." + err.reason)
			});
		}
	});
}

function calculateAnswerRowHeight() {
	return $(window).height() - $('.header-title').height() - $('#appTitle').height() - $('.voting-scripts-buttons').height() - $('.navbar-fixed-bottom').height() - 15;
}

export function formatAnswerButtons() {
	var answerRow = $('.answer-row');
	var answerButtonContainerHeight = calculateAnswerRowHeight();
	answerRow.css('height', answerButtonContainerHeight + 'px');

	var answerOptionsCount = answerRow.children().length;
	if (answerOptionsCount === 0) {
		setTimeout(function () {
			formatAnswerButtons();
		}, 100);
		return;
	}

	answerRow.children().removeClass('col-xs-12').removeClass('col-xs-6').removeClass('col-xs-4');
	if ($(window).width() < 300) {
		answerRow.children().addClass('col-xs-12');
	} else if (answerOptionsCount <= 6 || $(window).width() < 500) {
		answerRow.children().addClass('col-xs-6');
	} else {
		answerRow.children().addClass('col-xs-4');
	}

	answerRow.find('button').css('height', $('#0').width() + 'px');
}
