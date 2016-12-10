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
import {Tracker} from 'meteor/tracker';
import {Router} from 'meteor/iron:router';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';

export let countdown = null;
let currentButton = 0;
export let countdownRunning = false;

export const votingViewTracker = new Tracker.Dependency();

export function answerButtonAnimation() {
	const buttonsCount = $('.answer-row #buttonContainer').children().length;
	let lastButton;
	const secondsUntilNextRound = buttonsCount;
	const currentButtonElement = $('#' + currentButton);
	if (currentButton <= 0) {
		lastButton = buttonsCount - 1;
	} else {
		lastButton = currentButton - 1;
	}
	/* skip the selected answer options */
	while (currentButtonElement.hasClass('answer-selected')) {
		currentButton++;
		if (currentButton >= buttonsCount) {
			currentButton = 0 - secondsUntilNextRound;
		}
	}
	$('#' + lastButton).removeClass('button-green-transition').addClass('button-purple-transition');
	currentButtonElement.addClass('button-green-transition').removeClass('button-purple-transition');
	currentButton++;
	if (currentButton >= buttonsCount) {
		currentButton = 0 - secondsUntilNextRound;
	}
}

export function deleteCountdown() {
	if (countdown) {
		countdown.stop();
	}
	countdown = null;
	countdownRunning = false;
}

export function countdownFinish() {
	deleteCountdown();
	Router.go("/" + Router.current().params.quizName + "/results");
}

export function startCountdown(index) {
	Meteor.call("Main.calculateRemainingCountdown", Session.get("questionGroup").getHashtag(), index, function (error, response) {
		Session.set("sessionCountDown", response);
		countdown = new ReactiveCountdown(response);
		countdown.start(function () {
			if (countdown && countdown.get() === 0) {
				countdownFinish();
			}
		});
		Session.set("countdownInitialized", true);
	});
}

export function makeAndSendResponse(answerOptionNumber) {
	if (answerOptionNumber instanceof Object) {
		answerOptionNumber = $.map(answerOptionNumber, function (value, index) {
			if (value) {
				return index;
			}
		});
	}
	Meteor.call('ResponsesCollection.addResponse', {
		hashtag: Router.current().params.quizName,
		questionIndex: EventManagerCollection.findOne().questionIndex,
		answerOptionNumber: answerOptionNumber,
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
		answerOptionNumber: [0],
		userNick: localStorage.getItem(Router.current().params.quizName + "nick")
	});
}

export function quickfitText(reset) {
	const quickFitClass = "quickfit";
	const quickFitSetClass = "quickfitSet";

	if (reset) {
		$("." + quickFitSetClass).removeClass(quickFitSetClass);
	}
	const setMaxTextSize = function (item) {
		let fontSize = parseInt($(item).css("fontSize").replace("px", ""));
		let hasDummyText = false;
		if ($(item).find("p").length === 0) {
			$(item).append($("<p></p>").text($(item).text()));
			hasDummyText = true;
		}
		const contentItem = $(item).find("p").first();
		contentItem.css({"height": "auto"});
		if (contentItem.find("iframe").length > 0 && contentItem.find("p").length !== 0) {
			contentItem.css("height", "100%");
		}
		contentItem.css("display", "inline-flex");

		if (contentItem.width() < $(item).width() && contentItem.height() < $(item).height()) {
			do {
				$(item).css("font-size", fontSize);
			} while (++fontSize < 100 && contentItem.width() < $(item).width() && contentItem.height() < $(item).height());
			fontSize -= 2;
		} else {
			do {
				$(item).css("font-size", fontSize);
			} while (--fontSize > 3 && (contentItem.width() > $(item).width() || contentItem.height() > $(item).height()));
		}

		$(item).css("font-size", fontSize);
		$(item).addClass(quickFitSetClass);
		contentItem.css({"display": "block"});
		if (hasDummyText) {
			contentItem.remove();
		}
	};
	$("." + quickFitClass + ":not(." + quickFitSetClass + ")").each(function (index, item) {
		setMaxTextSize($(item));
	});
}
$(window).on("resize orientationchange", function () {
	quickfitText(true);
});

function calculateAnswerRowHeight() {
	let contentHeight = ($("#markdownPreviewWrapper").height() - $("h2.text-center").outerHeight(true)) || $(".contentPosition").height();
	return contentHeight - $('.voting-helper-buttons').height() - parseInt($('.answer-row').css("margin-top"));
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
		const answerOptionElements = $('.btn-answerOption').length;
		const calculateButtons = function (width, height) {
			let maxButtonsPerRow = Math.floor(contentWidth / width);
			let maxRows = Math.floor((contentHeight) / height);
			maxRows = Math.floor((contentHeight - maxRows * 10) / height);
			if (answerOptionElements % 2 === 0 && maxButtonsPerRow % 2 !== 0) {
				maxButtonsPerRow--;
			}
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
