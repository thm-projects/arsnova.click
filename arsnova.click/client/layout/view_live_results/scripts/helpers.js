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
import {Template} from 'meteor/templating';
import {TAPi18n} from 'meteor/tap:i18n';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {AnswerOptionCollection} from '/lib/answeroptions/collection.js';
import {MemberListCollection} from '/lib/member_list/collection.js';
import {ResponsesCollection} from '/lib/responses/collection.js';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {SessionConfigurationCollection} from '/lib/session_configuration/collection.js';
import * as localData from '/lib/local_storage.js';
import * as leaderboardLib from '/client/layout/view_leaderboard/scripts/lib.js';
import {countdown, getPercentRead, getCurrentRead, getProgressbarCSSClass, checkIfIsCorrect, isCountdownZero, setQuestionDialog} from './lib.js';

Template.liveResultsFooterNavButtons.helpers({
	isOwner: function () {
		return localData.containsHashtag(Router.current().params.quizName);
	},
	isRunningQuestion: ()=> {
		return Session.get("countdownInitialized");
	},
	showGlobalLeaderboardButton: ()=> {
		var questionDoc = QuestionGroupCollection.findOne();
		let eventDoc = EventManagerCollection.findOne();
		if (!questionDoc || !eventDoc) {
			return;
		}

		return countdown === null && questionDoc.questionList.length > 1 && eventDoc.questionIndex >= questionDoc.questionList.length - 1;
	},
	hasCorrectAnswerOptionsOrRangedQuestion: ()=> {
		const questionDoc = QuestionGroupCollection.findOne();
		let hasRangedQuestion = false;
		if (!questionDoc) {
			return;
		}
		$.each(questionDoc.questionList, function (index, element) {
			if (element.type === "RangedQuestion" || element.type === "FreeTextQuestion") {
				hasRangedQuestion = true;
				return false;
			}
		});
		return AnswerOptionCollection.find({isCorrect: true}).count() > 0 || hasRangedQuestion;
	},
	hasNextQuestion: ()=> {
		var questionDoc = QuestionGroupCollection.findOne();
		let eventDoc = EventManagerCollection.findOne();
		if (!questionDoc || !eventDoc) {
			return;
		}

		return eventDoc.questionIndex < questionDoc.questionList.length - 1;
	},
	showNextQuestionButton: ()=> {
		let eventDoc = EventManagerCollection.findOne();
		const configDoc = SessionConfigurationCollection.findOne();
		if (!eventDoc || !configDoc) {
			return;
		}
		return configDoc.readingConfirmationEnabled !== false && eventDoc.readingConfirmationIndex <= eventDoc.questionIndex;
	},
	allQuestionCount: function () {
		var doc = QuestionGroupCollection.findOne();
		return doc ? doc.questionList.length : false;
	},
	hasOnlyOneQuestion: ()=> {
		var questionDoc = QuestionGroupCollection.findOne();
		if (!questionDoc) {
			return;
		}

		return questionDoc.questionList.length === 1;
	},
	nextReadingConfirmationIndex: ()=> {
		let eventDoc = EventManagerCollection.findOne();
		if (!eventDoc) {
			return;
		}
		return eventDoc.readingConfirmationIndex + 2;
	},
	nextQuestionIndex: ()=> {
		let eventDoc = EventManagerCollection.findOne();
		if (!eventDoc) {
			return;
		}
		return eventDoc.questionIndex + 2;
	}
});

Template.liveResultsTitle.helpers({
	getCountVotings: function () {
		let eventDoc = EventManagerCollection.findOne();
		if (!eventDoc) {
			return 0;
		}

		var sumVoted = 0;
		MemberListCollection.find().map(function (member) {
			var responseDoc = ResponsesCollection.findOne({
				questionIndex: eventDoc.questionIndex,
				userNick: member.nick
			});
			if (responseDoc !== undefined) {
				sumVoted++;
			}
		});
		return sumVoted;
	},
	getCountdown: function () {
		if (Session.get("countdownInitialized")) {
			var roundedCountdown = Math.round(countdown.get());
			return roundedCountdown < 0 ? 0 : roundedCountdown;
		}
		return 0;
	},
	votingText: function () {
		return Session.get("sessionClosed") ? "view.liveResults.game_over" : "view.liveResults.countdown";
	},
	isRunningQuestion: ()=> {
		return Session.get("countdownInitialized");
	}
});

Template.liveResults.helpers({
	isCountdownZero: function (index) {
		return isCountdownZero(index);
	},
	getPercentRead: (index)=> {
		return getPercentRead(index);
	},
	getCurrentRead: (index)=> {
		var currentReadAmount = getCurrentRead(index);
		if (currentReadAmount > 0 || SessionConfigurationCollection.findOne({hashtag: Router.current().params.quizName}).readingConfirmationEnabled === false) {
			$('#startNextQuestion').removeAttr('disabled');
		}
		return currentReadAmount;
	},
	showLeaderBoardButton: function (index) {
		const questionDoc = QuestionGroupCollection.findOne();
		if (!questionDoc) {
			return;
		}
		return !Session.get("countdownInitialized") && questionDoc.questionList[index].type !== "SurveyQuestion";
	},
	isMC: function (index) {
		const questionDoc = QuestionGroupCollection.findOne();
		if (!questionDoc) {
			return;
		}
		return questionDoc.questionList[index].type === "MultipleChoiceQuestion";
	},
	mcOptions: function (index) {
		let allCorrect = 0;
		let allWrong = 0;
		const question = QuestionGroupCollection.findOne({hashtag: Router.current().params.quizName}).questionList[index];
		const responses = ResponsesCollection.find({questionIndex: index}).fetch();
		const memberAmount = responses.length;
		responses.forEach(function (responseItem) {
			if (leaderboardLib.isCorrectResponse(responseItem, question, index)) {
				allCorrect++;
			} else {
				allWrong++;
			}
		});
		return {
			allCorrect: {
				absolute: allCorrect,
				percent: memberAmount ? Math.floor((allCorrect * 100) / memberAmount) : 0,
				backgroundClass: getProgressbarCSSClass(index, checkIfIsCorrect(1))
			},
			allWrong: {
				absolute: allWrong,
				percent: memberAmount ? Math.floor((allWrong * 100) / memberAmount) : 0,
				backgroundClass: getProgressbarCSSClass(index, checkIfIsCorrect(0))
			}
		};
	},
	getNormalizedIndex: function (index) {
		return index + 1;
	},
	allQuestionCount: function () {
		var doc = QuestionGroupCollection.findOne();
		return doc ? doc.questionList.length : false;
	},
	questionList: function () {
		var questionDoc = QuestionGroupCollection.findOne();
		let eventDoc = EventManagerCollection.findOne();
		if (!questionDoc || !eventDoc) {
			return;
		}

		var questionList = questionDoc.questionList;
		if (eventDoc.readingConfirmationIndex < questionList.length - 1) {
			questionList.splice(eventDoc.readingConfirmationIndex + 1, questionList.length - (eventDoc.readingConfirmationIndex + 1));
		}

		for (var i = 0; i < questionList.length; i++) {
			questionList[i].displayIndex = i;
		}

		return questionList ? questionList.reverse() : false;
	},
	answerList: function (index) {
		const result = [];
		const hashtag = Router.current().params.quizName;
		const responseSet = ResponsesCollection.find({hashtag: hashtag, questionIndex: index});
		const memberAmount = responseSet.collection.find({hashtag: hashtag, questionIndex: index}).count();

		const allAnswerOptions = AnswerOptionCollection.find({
			hashtag: hashtag,
			questionIndex: index
		});
		const correctAnswerOptions = allAnswerOptions.collection.find({hashtag: hashtag, isCorrect: true}).count();

		allAnswerOptions.forEach(function (value) {
			const amount = responseSet.collection.find({
				hashtag: hashtag,
				questionIndex: index,
				answerOptionNumber: value.answerOptionNumber
			}).count();
			result.push({
				name: TAPi18n.__("view.liveResults.answer_option") + " " + String.fromCharCode(value.answerOptionNumber + 65),
				absolute: amount,
				percent: memberAmount ? (Math.floor((amount * 100) / memberAmount)) : 0,
				isCorrect: correctAnswerOptions ? value.isCorrect : -1,
				questionIndex: index,
				backgroundClass: getProgressbarCSSClass(index, checkIfIsCorrect(correctAnswerOptions ? value.isCorrect : -1))
			});
		});
		return result;
	},
	freeTextAnswerResult: function (index) {
		let correctAnswerCount = 0;
		let wrongAnswerCount = 0;
		const question = QuestionGroupCollection.findOne({hashtag: Router.current().params.quizName}).questionList[index];
		const responses = ResponsesCollection.find({questionIndex: index}).fetch();
		const memberAmount = responses.length;
		responses.forEach(function (responseItem) {
			if (leaderboardLib.isCorrectResponse(responseItem, question, index)) {
				correctAnswerCount++;
			} else {
				wrongAnswerCount++;
			}
		});
		return {
			correct: {
				absolute: correctAnswerCount,
				percent: memberAmount ? Math.floor((correctAnswerCount * 100) / memberAmount) : 0,
				backgroundClass: getProgressbarCSSClass(index, checkIfIsCorrect(1))
			},
			wrong: {
				absolute: wrongAnswerCount,
				percent: memberAmount ? Math.floor((wrongAnswerCount * 100) / memberAmount) : 0,
				backgroundClass: getProgressbarCSSClass(index, checkIfIsCorrect(0))
			}
		};
	},
	rangedAnswerResult: function (index) {
		let inCorrectRange = 0;
		let inWrongRange = 0;
		const question = QuestionGroupCollection.findOne({hashtag: Router.current().params.quizName}).questionList[index];
		const responses = ResponsesCollection.find({questionIndex: index}).fetch();
		const memberAmount = responses.length;
		responses.forEach(function (responseItem) {
			if (leaderboardLib.isCorrectResponse(responseItem, question, index)) {
				inCorrectRange++;
			} else {
				inWrongRange++;
			}
		});
		return {
			allCorrect: {
				absolute: inCorrectRange,
				percent: memberAmount ? Math.floor((inCorrectRange * 100) / memberAmount) : 0,
				backgroundClass: getProgressbarCSSClass(index, checkIfIsCorrect(1))
			},
			allWrong: {
				absolute: inWrongRange,
				percent: memberAmount ? Math.floor((inWrongRange * 100) / memberAmount) : 0,
				backgroundClass: getProgressbarCSSClass(index, checkIfIsCorrect(0))
			}
		};
	},
	isRangedQuestion: function (index) {
		const questionDoc = QuestionGroupCollection.findOne();
		if (!questionDoc) {
			return;
		}
		return questionDoc.questionList[index].type === "RangedQuestion";
	},
	isFreeTextQuestion: function (index) {
		const questionDoc = QuestionGroupCollection.findOne();
		if (!questionDoc) {
			return;
		}
		return questionDoc.questionList[index].type === "FreeTextQuestion";
	},
	hasOnlyOneQuestion: ()=> {
		var questionDoc = QuestionGroupCollection.findOne();
		if (!questionDoc) {
			return;
		}

		return questionDoc.questionList.length === 1;
	},
	hasReadConfirmationRequested: (index)=> {
		const eventDoc = EventManagerCollection.findOne();
		const configDoc = SessionConfigurationCollection.findOne();
		if (!eventDoc) {
			return;
		}
		return index <= eventDoc.questionIndex || configDoc.readingConfirmationEnabled === false;
	},
	isReadingConfirmationEnabled: ()=> {
		const configDoc = SessionConfigurationCollection.findOne();
		if (!configDoc) {
			return;
		}
		return configDoc.readingConfirmationEnabled !== false;
	},
	readingConfirmationListForQuestion: (index)=> {
		let result = [];
		let sortParamObj = Session.get('LearnerCountOverride') ? {lowerCaseNick: 1} : {insertDate: -1};
		let ownNick = MemberListCollection.findOne({nick: localStorage.getItem(Router.current().params.quizName + "nick")}, {limit: 1});
		if (ownNick && ownNick.readConfirmed[index]) {
			result.push(ownNick);
		}
		MemberListCollection.find({nick: {$ne: localStorage.getItem(Router.current().params.quizName + "nick")}}, {
			sort: sortParamObj
		}).forEach(function (doc) {
			if (result.length < Session.get("LearnerCount") && doc.readConfirmed[index]) {
				result.push(doc);
			}
		});
		return result;
	},
	showMoreButton: function (index) {
		var result = [];
		MemberListCollection.find().forEach(function (doc) {
			if (doc.readConfirmed[index]) {
				result.push(doc);
			}
		});
		return ((result.length - Session.get("LearnerCount")) > 1);
	},
	invisibleLearnerCount: function (index) {
		var result = [];
		MemberListCollection.find().forEach(function (doc) {
			if (doc.readConfirmed[index]) {
				result.push(doc);
			}
		});
		return result.length - Session.get("LearnerCount");
	}
});


Template.readingConfirmedLearner.helpers({
	isOwnNick: function (nickname) {
		return nickname === localStorage.getItem(Router.current().params.quizName + "nick");
	}
});

Template.gamificationAnimation.helpers({
	getCurrentAnimationSrc: function () {
		const countdownAnimationWrapper = $('#countdownAnimationWrapper');

		if (!Session.get("countdownInitialized") || !countdown) {
			if (!countdownAnimationWrapper.is(":hidden")) {
				countdownAnimationWrapper.fadeOut();
			}
			return;
		}

		const countdownValue = countdown.get();

		if (countdownValue <= 6) {
			setQuestionDialog(null);
		}
		countdownAnimationWrapper.show();
		switch (countdownValue) {
			case 1:
				countdownAnimationWrapper.css("background-color", "#f4d717");
				countdownAnimationWrapper.delay(1000).fadeOut();
				break;
			case 2:
				countdownAnimationWrapper.css("background-color", "#eca121");
				break;
			case 3:
				countdownAnimationWrapper.css("background-color", "#cd2a2b");
				break;
			case 4:
				countdownAnimationWrapper.css("background-color", "#c51884");
				break;
			case 5:
				countdownAnimationWrapper.css("background-color", "#1c7bb5");
				break;
			case 6:
				countdownAnimationWrapper.css("background-color", "#66bb5e");
				break;
			default:
				countdownAnimationWrapper.hide();
				return;
		}

		return "finger_" + (countdownValue - 1) + ".gif";
	}
});
