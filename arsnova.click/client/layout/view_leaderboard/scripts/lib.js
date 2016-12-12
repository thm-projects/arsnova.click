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
import {Tracker} from 'meteor/tracker';
import {Router} from 'meteor/iron:router';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {AnswerOptionCollection} from '/lib/answeroptions/collection.js';
import {ResponsesCollection} from '/lib/responses/collection.js';
import {QuestionGroupCollection} from '/lib/questions/collection.js';

export const leaderboardTracker = new Tracker.Dependency();

export function setMaxResponseButtons(value) {
	Session.set("maxResponseButtons", value);
}

export function calculateButtonCount(allMembersCount) {
	/*
	 This session variable determines if the user has clicked on the show-more-button. The button count must not
	 be calculated then. It is set in the event handler of the button and is reset if the user reenters the page
	 */
	if (Session.get("responsesCountOverride")) {
		setMaxResponseButtons(allMembersCount);
		return;
	}

	/*
	 To calculate the maximum output of attendee button rows we need to:
	 - get the mainContentContainer height (the content wrapper for all elements)
	 - subtract the appTitle height (the indicator for the question index)
	 */
	var viewport = $('.contentPosition');

	var viewPortHeight = viewport.outerHeight();

	/* The height of the learner button must be set manually if the html elements are not yet generated */
	var btnLearnerHeight = $('.button-leader').first().parent().outerHeight(true) ? $('.button-leader').first().parent().outerHeight(true) : 70;

	/* Calculate how much buttons we can place in the viewport until we need to scroll */
	var queryLimiter = Math.floor(viewPortHeight / btnLearnerHeight);

	/*
	 Multiply the displayed elements by 2 if on widescreen and reduce the max output of buttons by 1 row for the display
	 more button if necessary. Also make sure there is at least one row of buttons shown even if the user has to scroll
	 */
	var limitModifier = viewport.outerWidth() >= 992 ? 2 : 1;

	queryLimiter *= limitModifier;
	if (queryLimiter <= 0) {
		queryLimiter = limitModifier;
	}

	/*
	 This variable holds the amount of shown buttons and is used in the scripts functions
	 */
	setMaxResponseButtons(queryLimiter);
}

function checkIsCorrectSingleChoiceQuestion(response, questionIndex) {
	let hasCorrectAnswer = false;
	AnswerOptionCollection.find({
		isCorrect: true,
		questionIndex: questionIndex,
		inputValue: response.inputValue,
		hashtag: Router.current().params.quizName
	}).fetch().forEach(function (answeroption) {
		hasCorrectAnswer = $.inArray(answeroption.answerOptionNumber, response.answerOptionNumber) > -1;
	});
	return hasCorrectAnswer;
}

function checkIsCorrectMultipleChoiceQuestion(response, questionIndex) {
	let hasCorrectAnswer = 0;
	let hasWrongAnswer = 0;
	const allCorrectAnswerOptions = AnswerOptionCollection.find({
		isCorrect: true,
		questionIndex: questionIndex,
		inputValue: response.inputValue,
		hashtag: Router.current().params.quizName
	}).fetch();
	response.answerOptionNumber.every(function (element) {
		const tmpCorrectAnswer = hasCorrectAnswer;
		allCorrectAnswerOptions.every(function (item) {
			if (element === item.answerOptionNumber) {
				hasCorrectAnswer++;
				return false;
			}
			return true;
		});
		if (tmpCorrectAnswer === hasCorrectAnswer) {
			hasWrongAnswer++;
		}
		return true;
	});
	if (hasCorrectAnswer > 0) {
		if (hasWrongAnswer > 0) {
			return 0;
		}
		if (allCorrectAnswerOptions.length === hasCorrectAnswer) {
			return 1;
		} else {
			return 0;
		}
	}
	return -1;
}

function checkIsCorrectRangedQuestion(response, questionIndex) {
	const question = QuestionGroupCollection.findOne({
		hashtag: Router.current().params.quizName
	}).questionList[questionIndex];
	return response.rangedInputValue >= question.rangeMin && response.rangedInputValue <= question.rangeMax;
}

function checkIsCorrectFreeTextQuestion(response, questionIndex) {
	const answerOption = AnswerOptionCollection.findOne({questionIndex: questionIndex}) || Session.get("questionGroup").getQuestionList()[questionIndex].getAnswerOptionList()[0].serialize();
	let	userHasRightAnswers = false;
	if (!answerOption.configCaseSensitive) {
		answerOption.answerText = answerOption.answerText.toLowerCase();
		response.freeTextInputValue = response.freeTextInputValue.toLowerCase();
	}
	if (!answerOption.configUsePunctuation) {
		answerOption.answerText = answerOption.answerText.replace(/(\.)*(,)*(!)*(")*(;)*(\?)*/g, "");
		response.freeTextInputValue = response.freeTextInputValue.replace(/(\.)*(,)*(!)*(")*(;)*(\?)*/g, "");
	}
	if (answerOption.configUseKeywords) {
		if (!answerOption.configTrimWhitespaces) {
			answerOption.answerText = answerOption.answerText.replace(/ /g, "");
			response.freeTextInputValue = response.freeTextInputValue.replace(/ /g, "");
		}
		userHasRightAnswers = answerOption.answerText === response.freeTextInputValue;
	} else {
		let hasCorrectKeywords = true;
		answerOption.answerText.split(" ").forEach(function (keyword) {
			if (response.freeTextInputValue.indexOf(keyword) === -1) {
				hasCorrectKeywords = false;
			}
		});
		userHasRightAnswers = hasCorrectKeywords;
	}
	return userHasRightAnswers;
}

export function isCorrectResponse(response, question, questionIndex) {
	switch (question.type) {
		case "SingleChoiceQuestion":
		case "YesNoSingleChoiceQuestion":
		case "TrueFalseSingleChoiceQuestion":
			return checkIsCorrectSingleChoiceQuestion(response, questionIndex);
		case "MultipleChoiceQuestion":
			return checkIsCorrectMultipleChoiceQuestion(response, questionIndex);
		case "SurveyQuestion":
			return false;
		case "RangedQuestion":
			return checkIsCorrectRangedQuestion(response, questionIndex);
		case "FreeTextQuestion":
			return checkIsCorrectFreeTextQuestion(response, questionIndex);
		default:
			throw new Error("Unsupported question type while checking correct response");
	}
}

export function objectToArray(obj) {
	return $.map(obj, function (value, index) {
		return [{nick: index, responseTime: value}];
	});
}

export function getLeaderboardItemsByIndex(questionIndex) {
	const hashtag = Router.current().params.quizName;
	const question = QuestionGroupCollection.findOne({
		hashtag: hashtag
	}).questionList[questionIndex];
	const result = {};
	ResponsesCollection.find({
		hashtag: hashtag,
		questionIndex: questionIndex
	}).forEach(function (item) {
		const isCorrect = isCorrectResponse(item, question, questionIndex);
		if (isCorrect === true || isCorrect > 0) {
			if (typeof result[item.userNick] === "undefined") {
				result[item.userNick] = 0;
			}
			result[item.userNick] += item.responseTime;
		}
	});
	return result;
}

export function getAllLeaderboardItems() {
	let allItems = getLeaderboardItemsByIndex(0);
	for (let i = 1; i < EventManagerCollection.findOne().questionIndex + 1; i++) {
		const tmpItems = getLeaderboardItemsByIndex(i);
		var result = {};
		for (const o in tmpItems) {
			if (tmpItems.hasOwnProperty(o)) {
				if (typeof allItems[o] !== "undefined" && typeof tmpItems[o] !== "undefined") {
					result[o] = allItems[o] + tmpItems[o];
				} else {
					delete result[o];
				}
			}
		}
		allItems = result;
	}
	return allItems;
}

export function generateExportData() {
	const items = Session.get("nicks");
	let csvString = "";
	let hasIdentifiedUsers = false;
	items.forEach(function (item) {
		let responseTime = item.responseTime;
		const response = ResponsesCollection.findOne({hashtag: Router.current().params.quizName, userNick: item.nick}, {userRef: 1});
		if (typeof response.profile !== "undefined") {
			response.profile = $.parseJSON(response.profile);
			hasIdentifiedUsers = true;
			item.id      = response.profile.id;
			item.mail    = response.profile.mail instanceof Array ? response.profile.mail.join(",") : response.profile.mail;
			csvString += item.nick + "," + responseTime + "," + item.id + "," + item.mail + "\n";
		} else {
			csvString += item.nick + "," + responseTime + "\n";
		}
	});
	const csvHeader = hasIdentifiedUsers ? "Nickname,ResponseTime (ms),UserID,Email\n" : "Nickname,ResponseTime (ms)\n";
	return csvHeader + csvString;
}
