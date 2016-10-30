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
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {AnswerOptionCollection} from '/lib/answeroptions/collection.js';

export let countdown = null;
export let currentButton = 0;
export let countdownRunning = false;
let questionIndex = -1;

export function deleteCountdown() {
	if (countdown) {
		countdown.stop();
	}
	countdown = null;
	countdownRunning = false;
}

export function countdownFinish() {
	if (Session.get("countdownInitialized") && countdownRunning) {
		Session.set("countdownInitialized", false);
		deleteCountdown();
		if (questionIndex + 1 >= QuestionGroupCollection.findOne().questionList.length) {
			Session.set("sessionClosed", true);
		}
		Router.go("/" + Router.current().params.quizName + "/results");
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
			var buttonsCount = $('.answer-row #buttonContainer').children().length;
			var lastButton;
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
		},
		completed: function () {
			if (countdown && countdown.get() === 0) {
				countdownFinish();
			}
		}
	});
	countdown.start();
	Session.set("countdownInitialized", true);
}

export function makeAndSendResponse(answerOptionNumber) {
	Meteor.call('ResponsesCollection.addResponse', {
		hashtag: Router.current().params.quizName,
		questionIndex: EventManagerCollection.findOne().questionIndex,
		answerOptionNumber: Number(answerOptionNumber),
		userNick: localStorage.getItem(Router.current().params.quizName + "nick")
	});
}

export function makeAndSendRangedResponse(value) {
	Meteor.call('ResponsesCollection.addResponse', {
		hashtag: Router.current().params.quizName,
		questionIndex: EventManagerCollection.findOne().questionIndex,
		rangedInputValue: value,
		userNick: localStorage.getItem(Router.current().params.quizName + "nick")
	});
}

export function makeAndSendFreeTextResponse(value) {
	Meteor.call('ResponsesCollection.addResponse', {
		hashtag: Router.current().params.quizName,
		questionIndex: EventManagerCollection.findOne().questionIndex,
		freeTextInputValue: value,
		answerOptionNumber: 0,
		userNick: localStorage.getItem(Router.current().params.quizName + "nick")
	});
}

function calculateAnswerRowHeight() {
	return $(window).height() - $('.header-title').height() - $('#appTitle').height() - 20 /*padding height of apptitle*/ - $('.voting-helper-buttons').height() - $('.navbar-fixed-bottom').height() - 15;
}

export function formatAnswerButtons() {
	const answerRow = $('.answer-row');
	const buttonElements = $('.buttonWrapper');
	const buttonContainer = $('#buttonContainer');
	buttonContainer.css({width: ""});
	buttonElements.removeClass("col-xs-6").css({float: "", margin: "", width: "", height: ""});
	const contentHeight = calculateAnswerRowHeight();
	answerRow.css({height: contentHeight + 'px'});
	const contentWidth = answerRow.outerWidth();
	const containerWidth = $(window).outerWidth();
	if (containerWidth <= 768) {
		buttonElements.find("button").css({margin: "5px 0"});
		buttonElements.addClass("col-xs-6");
	} else {
		let scaleBaseWidth = 100;
		let scaleBaseHeight = 100;
		const answerOptionElements = AnswerOptionCollection.find({hashtag: Router.current().params.quizName, questionIndex: EventManagerCollection.findOne().questionIndex}).count();
		const calculateButtons = function (width, height) {
			const maxButtonsPerRow = Math.floor(contentWidth / width);
			let maxRows = Math.floor((contentHeight) / height);
			maxRows = Math.floor((contentHeight - maxRows * 10) / height);
			return {maxButtons: maxButtonsPerRow * maxRows, maxButtonsPerRow: maxButtonsPerRow, maxRows: maxRows};
		};
		let maxButtons = calculateButtons(scaleBaseWidth, scaleBaseHeight).maxButtons;
		while (calculateButtons(scaleBaseWidth + 1, scaleBaseHeight + 1).maxButtons > answerOptionElements) {
			maxButtons = calculateButtons(++scaleBaseWidth, ++scaleBaseHeight).maxButtons;
		}
		const calculateResult = calculateButtons(scaleBaseWidth, scaleBaseHeight);
		const strechedWidth = ((contentWidth / calculateResult.maxButtonsPerRow) - 10);
		buttonElements.css({float: "left", margin: "5px", width: strechedWidth + "px", height: scaleBaseHeight});
		buttonContainer.css({width: strechedWidth * calculateResult.maxButtonsPerRow + (calculateResult.maxButtonsPerRow * 10)});
	}
}
