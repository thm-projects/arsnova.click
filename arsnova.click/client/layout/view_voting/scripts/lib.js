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
import {ReactiveCountdown} from 'meteor/flyandi:reactive-countdown';
import {noUiSlider} from 'meteor/arsnova.click:nouislider';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {SessionConfigurationCollection} from '/lib/session_configuration/collection.js';
import {hslColPerc} from '/client/layout/view_live_results/scripts/lib.js';

export let countdown = null;
export let countdownRunning = false;

export const votingViewTracker = new Tracker.Dependency();
export const toggledResponseTracker = new Tracker.Dependency();

let sliderObject = null;
export function createSlider() {
	Session.set("confidenceValue", 100);
	if (!SessionConfigurationCollection.findOne().confidenceSliderEnabled) {
		Session.set("confidenceValue", -1);
		return;
	}
	const plainSlider = document.getElementById('votingConfidenceSlider');
	if (!plainSlider) {
		return;
	}
	plainSlider.style.background = hslColPerc(100, 0, 100);
	sliderObject = noUiSlider.create(plainSlider, {
		step: 25,
		margin: 1,
		start: 100,
		range: {
			'min': 0,
			'max': 100
		}
	});
	sliderObject.on('slide', function (val) {
		const roundedValue = Math.round(val);
		Session.set("confidenceValue", roundedValue);
		plainSlider.style.background = hslColPerc(roundedValue, 0, 100);
	});
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
		confidenceValue: Session.get("confidenceValue"),
		userNick: sessionStorage.getItem(Router.current().params.quizName + "nick")
	});
}

export function makeAndSendRangedResponse(value) {
	Meteor.call('ResponsesCollection.addResponse', {
		hashtag: Router.current().params.quizName,
		questionIndex: EventManagerCollection.findOne().questionIndex,
		rangedInputValue: value,
		confidenceValue: Session.get("confidenceValue"),
		userNick: sessionStorage.getItem(Router.current().params.quizName + "nick")
	});
}

export function makeAndSendFreeTextResponse(value) {
	Meteor.call('ResponsesCollection.addResponse', {
		hashtag: Router.current().params.quizName,
		questionIndex: EventManagerCollection.findOne().questionIndex,
		freeTextInputValue: value,
		answerOptionNumber: [0],
		confidenceValue: Session.get("confidenceValue"),
		userNick: sessionStorage.getItem(Router.current().params.quizName + "nick")
	});
}

const quickFitClass = "quickfit";
const quickFitSetClass = "quickfitSet";
let smallestFontSize = 3;
export function resetQuickfitText() {
	$(`.${quickFitSetClass}`).removeClass(quickFitSetClass);
	smallestFontSize = 3;
}
/**
 * Calculates the width of the largest child element
 * @source http://stackoverflow.com/a/20768042
 * @param selector The id of the selector which has to be checked
 * @returns {Number} The width of the largest child element
 */
function calcWidth(selector) {
	return Math.max.apply(Math, $(`#${selector} *`).map(function () {
		if ($(this).text().length > 0) { return $(this).outerWidth(); }
	}).get());
}
function calculateMaxTextSize(item) {
	let hasDummyText = false;
	const itemWidth = $(item).width();
	const itemHeight = $(item).height();

	if ($(item).find("p").length === 0) {
		const itemText = $(item).text();
		$(item).text("");
		$(item).append($("<p></p>").text(itemText));
		hasDummyText = true;
	}
	const contentItem = $(item).find("p").first();
	contentItem.css({"height": "auto", "display": "inline-flex"});

	$(contentItem).css("font-size", smallestFontSize);
	while (calcWidth($(item).attr("id")) < itemWidth && $(contentItem).outerHeight() < itemHeight && smallestFontSize < 100) {
		$(contentItem).css({"font-size": smallestFontSize++});
	}
	smallestFontSize -= 2; // -1 for the last incrementation in the loop, -1 again because the last loop incrementation doesn't fit anymore
	$(contentItem).css("font-size", "inherit");

	if (hasDummyText) {
		const itemText = $(contentItem).text();
		contentItem.remove();
		$(item).text(itemText);
	}
}
export function quickfitText(reset) {
	if (reset) {
		resetQuickfitText();
	}
	const quickfitSelector = $(`.${quickFitClass}:not(.${quickFitSetClass})`);
	const quickfitMap = quickfitSelector.map((i, x)=> {return $(x).text().trim().length;}).get();
	if (quickfitMap.length !== $('.buttonWrapper').length) {
		return;
	}
	const sortedMap = JSON.parse(JSON.stringify(quickfitMap)).sort((a, b) => a - b).reverse()[0];
	const largestTextIndex = quickfitMap.indexOf(sortedMap);
	calculateMaxTextSize($(quickfitSelector[largestTextIndex]));
	$(`.${quickFitClass}`).addClass(quickFitSetClass).css("font-size", smallestFontSize);
}
$(window).on("resize orientationchange", function () {
	quickfitText(true);
});

function calculateAnswerRowHeight() {
	let contentHeight = ($("#markdownPreviewWrapper").height() - $("h2.text-center").outerHeight(true)) || $(".contentPosition").height();
	return contentHeight - $('.voting-helper-buttons').height() - $('#votingViewFooterNavButtons').height() - parseInt($('.answer-row').css("margin-top"));
}

function calculateButtons(answerOptionElements, contentWidth, contentHeight, width, height) {
	let maxButtonsPerRow = Math.floor(contentWidth / width);
	const maxRows = Math.floor((contentHeight - (Math.floor(contentHeight / height)) * 10) / height);
	if (answerOptionElements % 2 === 0 && maxButtonsPerRow % 2 !== 0) {
		maxButtonsPerRow--;
	}
	return {maxButtons: maxButtonsPerRow * maxRows, maxButtonsPerRow: maxButtonsPerRow, maxRows: maxRows};
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
	let scaleBaseWidth = 100;
	let scaleBaseHeight = 100;
	const hasVideoElements = $("object").length > 0;
	if ($(window).width() < 786 || hasVideoElements) {
		scaleBaseWidth  = contentWidth / 2 - 10;
	}
	if (hasVideoElements) {
		scaleBaseHeight = 160;
	}
	const answerOptionElements = $('.sendResponse').length;
	let calculateResult;
	do {
		calculateResult = calculateButtons(answerOptionElements, contentWidth, contentHeight, ++scaleBaseWidth, ++scaleBaseHeight);
	} while (calculateResult.maxButtons >= answerOptionElements);
	calculateResult = calculateButtons(answerOptionElements, contentWidth, contentHeight, --scaleBaseWidth, --scaleBaseHeight);
	let stretchedWidth = ((contentWidth / calculateResult.maxButtonsPerRow) - 10);
	if (scaleBaseHeight * calculateResult.maxRows > contentHeight) {
		stretchedWidth -= 10;
	}
	buttonElements.css({float: "left", margin: "5px", width: stretchedWidth + "px", height: scaleBaseHeight});
	buttonContainer.css({width: stretchedWidth * calculateResult.maxButtonsPerRow + (calculateResult.maxButtonsPerRow * 10)});
}
