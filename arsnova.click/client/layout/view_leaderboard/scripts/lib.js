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
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {AnswerOptionCollection} from '/lib/answeroptions/collection.js';
import {MemberListCollection} from '/lib/member_list/collection.js';
import {ResponsesCollection} from '/lib/responses/collection.js';
import {QuestionGroupCollection} from '/lib/questions/collection.js';

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
	var viewport = $('.container'),
		appTitle = $('#appTitle'),
		firstItem = $('.firstLeaderBordItem');

	var viewPortHeight = viewport.outerHeight() - appTitle.outerHeight() - firstItem.outerHeight();

	/* The height of the learner button must be set manually if the html elements are not yet generated */
	var btnLearnerHeight = $('.button-leader').first().outerHeight(true) ? $('.button-leader').first().outerHeight(true) : 50;

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

function getLeaderBoardItemsByIndex(index) {
	var allGoodMembers = [];
	var param = {isCorrect: true, hashtag: Router.current().params.quizName};
	param.questionIndex = index;
	var rightAnswerOptions = AnswerOptionCollection.find(param);
	delete param.isCorrect;

	MemberListCollection.find({}, {fields: {nick: 1}}).forEach(function (member) {
		param.userNick = member.nick;
		var userResponses = ResponsesCollection.find(param).fetch();
		delete param.userNick;
		var userHasRightAnswers = true;
		// only put member in leaderboard when he clicked the right amount, then check whether he clicked all the right ones
		var totalResponseTime = 0;
		const questionItem = QuestionGroupCollection.findOne().questionList[index];
		if ((userResponses.length === rightAnswerOptions.count() || questionItem.type === "RangedQuestion") &&
			(userResponses.length > 0) && userHasRightAnswers && questionItem.type !== "FreeTextQuestion") {
			userResponses.forEach(function (userResponse) {
				param.isCorrect = true;
				param.answerOptionNumber = userResponse.answerOptionNumber;
				param.inputValue = questionItem.type === "RangedQuestion" ? userResponse.rangedInputValue : userResponse.inputValue;
				const checkAnswerOptionDoc = AnswerOptionCollection.findOne(param);
				const checkQuestionDoc = param.inputValue >= questionItem.rangeMin && param.inputValue <= questionItem.rangeMax;
				delete param.isCorrect;
				delete param.answerOptionNumber;
				delete param.inputValue;
				if (((questionItem.type !== "RangedQuestion" && !checkAnswerOptionDoc) || questionItem.type === "RangedQuestion") &&
					!checkQuestionDoc) {
					userHasRightAnswers = false;
				} else {
					totalResponseTime += userResponse.responseTime;
				}
			});
			if (userHasRightAnswers) {
				// rightAnswerOtions.count() will be 0 for RangedQuestions since they do not contain any answerOptions
				const responseTime = rightAnswerOptions.count() === 0 ? 1 : rightAnswerOptions.count();
				allGoodMembers.push({
					nick: member.nick,
					responseTime: totalResponseTime / responseTime
				});
			}
		} else if (questionItem.type === "FreeTextQuestion") {
			let answerOption = AnswerOptionCollection.findOne({questionIndex: index});
			if (!answerOption.configCaseSensitive) {
				answerOption.answerText = answerOption.answerText.toLowerCase();
			}
			if (!answerOption.configTrimWhitespaces) {
				answerOption.answerText = answerOption.answerText.replace(/ /g, "");
			}
			if (!answerOption.configUsePunctuation) {
				answerOption.answerText = answerOption.answerText.replace(/(\.)*(,)*(!)*(")*(;)*(\?)*/g, "");
			}
			const responseValue = ResponsesCollection.findOne({
				questionIndex: index,
				answerOptionNumber: 0,
				userNick: member.nick
			});
			if (responseValue) {
				if (!answerOption.configCaseSensitive) {
					responseValue.freeTextInputValue = responseValue.freeTextInputValue.toLowerCase();
				}
				if (!answerOption.configTrimWhitespaces) {
					responseValue.freeTextInputValue = responseValue.freeTextInputValue.replace(/ /g, "");
				}
				if (!answerOption.configUsePunctuation) {
					responseValue.freeTextInputValue = responseValue.freeTextInputValue.replace(/(\.)*(,)*(!)*(")*(;)*(\?)*/g, "");
				}
				if (answerOption.configUseKeywords) {
					userHasRightAnswers = answerOption.answerText === responseValue.freeTextInputValue;
				} else {
					let hasCorrectKeywords = true;
					answerOption.answerText.split(" ").forEach(function (keyword) {
						if (responseValue.freeTextInputValue.indexOf(keyword) === -1) {
							hasCorrectKeywords = false;
						}
					});
					userHasRightAnswers = hasCorrectKeywords;
				}
				if (userHasRightAnswers) {
					allGoodMembers.push({
						nick: member.nick,
						responseTime: responseValue.responseTime
					});
				}
			}
		}
	});

	Session.set("allMembersCount",allGoodMembers.length);
	calculateButtonCount(allGoodMembers.length);
	return _.sortBy(allGoodMembers, 'responseTime').slice(0, Session.get("maxResponseButtons"));
}

export function getLeaderBoardItems() {
	if (Router.current().params.id === "all") {
		if (!EventManagerCollection.findOne()) {
			return [];
		}
		var result = [];
		for (var i = 0; i <= EventManagerCollection.findOne().questionIndex; i++) {
			result.push({
				index: i,
				value: getLeaderBoardItemsByIndex(i)
			});
		}

		return result;
	} else {
		return [{value: getLeaderBoardItemsByIndex(parseInt(Router.current().params.id))}];
	}
}

function getAllNonPollingLeaderBoardItems() {
	const result = [];
	const questionGroup = QuestionGroupCollection.findOne();
	for (var i = 0; i <= EventManagerCollection.findOne().questionIndex; i++) {
		// pollings / surveys doesn't matter - just pick all others
		if (questionGroup.questionList[i].type !== "SurveyQuestion") {
			result.push({
				index: i,
				value: getLeaderBoardItemsByIndex(i)
			});
		}
	}
	return result;
}

/**
 * Sorts an object by its property value
 * @see http://stackoverflow.com/a/4760279
 * @param property
 * @returns {Function}
 */
function dynamicSort(property) {
	var sortOrder = 1;
	if (property[0] === "-") {
		sortOrder = -1;
		property = property.substr(1);
	}
	return function (a,b) {
		var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
		return result * sortOrder;
	};
}

export function getAllNicksWhichAreAlwaysRight() {
	var leaderBoardItems = getAllNonPollingLeaderBoardItems();
	var amountQuestions = EventManagerCollection.findOne().questionIndex + 1;
	var amountSurveys = 0;
	const questionGroup = QuestionGroupCollection.findOne();
	for (var i = 0; i <= amountQuestions - 1; i++) {
		if (questionGroup.questionList[i].type === "SurveyQuestion") {
			amountSurveys++;
		}
	}
	const amountRatableQuestions = amountQuestions - amountSurveys;

	var allNicksAndTimes = [];
	$.each(leaderBoardItems, function (index, value) {
		$.each(value.value, function (i2, v2) {
			allNicksAndTimes.push({nick: v2.nick, time: v2.responseTime});
		});
	});
	var allTimeWinners = [];
	$.each(allNicksAndTimes, function (index, value) {
		var nickOccuresAmount = 0;
		var nickSumTime = 0;
		$.each(allNicksAndTimes, function (i2, v2) {
			if (v2.nick === value.nick) {
				nickOccuresAmount++;
				nickSumTime += v2.time;
			}
		});
		if (nickOccuresAmount === amountRatableQuestions) {
			var alreadyExists = false;
			$.each(allTimeWinners, function (i3, v3) {
				if (v3.value === value.nick) {
					alreadyExists = true;
					return false;
				}
			});
			if (!alreadyExists) {
				allTimeWinners.push({value: value.nick, sumResponseTime: nickSumTime});
			}
		}
	});
	return allTimeWinners.sort(dynamicSort("sumResponseTime"));
}
