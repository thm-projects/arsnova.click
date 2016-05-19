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
import {HashtagsCollection} from '/lib/hashtags/collection.js';
import * as localData from '/lib/local_storage.js';
import {countdown, getPercentRead, getCurrentRead, hslColPerc, checkIfIsCorrect, whistleSound} from './lib.js';

Template.liveResults.helpers({
	votingText: function () {
		return Session.get("sessionClosed") ? "view.liveResults.game_over" : "view.liveResults.countdown";
	},
	isOwner: function () {
		return localData.containsHashtag(Router.current().params.quizName);
	},
	getCountdown: function () {
		if (Session.get("countdownInitialized")) {
			var roundedCountdown = Math.round(countdown.get());
			return roundedCountdown < 0 ? 0 : roundedCountdown;
		}
		return 0;
	},
	isCountdownZero: function (index) {
		let eventDoc = EventManagerCollection.findOne();
		if (!eventDoc) {
			return;
		}
		if (localData.containsHashtag(Router.current().params.quizName)) {
			if (Session.get("sessionClosed") || !Session.get("countdownInitialized") || eventDoc.questionIndex !== index) {
				return true;
			} else {
				var timer = Math.round(countdown.get());
				return timer <= 0;
			}
		} else {
			let questionDoc = QuestionGroupCollection.findOne();
			if (!questionDoc) {
				return;
			}
			var question = questionDoc.questionList[eventDoc.questionIndex];

			return !(eventDoc.questionIndex === index && new Date().getTime() - parseInt(question.startTime) < question.timer);
		}
	},
	getCountStudents: function () {
		return MemberListCollection.find().count();
	},
	getPercentRead: (index)=> {
		return getPercentRead(index);
	},
	getCurrentRead: (index)=> {
		var currentReadAmount = getCurrentRead(index);
		if (currentReadAmount > 0) {
			$('#startNextQuestion').prop('disabled', false);
		}
		return currentReadAmount;
	},
	sessionClosed: function () {
		return Session.get("sessionClosed");
	},
	showLeaderBoardButton: function (index) {
		return !Session.get("countdownInitialized") && (AnswerOptionCollection.find({
				questionIndex: index,
				isCorrect: 1
			}).count() > 0);
	},
	isMC: function (index) {
		return AnswerOptionCollection.find({
				questionIndex: index,
				isCorrect: 1
			}).count() > 1;
	},
	mcOptions: function (index) {
		let memberAmount = ResponsesCollection.find({questionIndex: index}).fetch();
		memberAmount = _.uniq(memberAmount, false, function (user) {
			return user.userNick;
		}).length;

		const correctAnswers = [];
		AnswerOptionCollection.find({
			questionIndex: index,
			isCorrect: 1
		}, {fields: {"answerOptionNumber": 1}}).forEach(function (answer) {
			correctAnswers.push(answer.answerOptionNumber);
		});
		let allCorrect = 0;
		let allWrong = 0;
		MemberListCollection.find().forEach(function (user) {
			let responseAmount = 0;
			let everythingRight = true;
			let everythingWrong = true;
			ResponsesCollection.find({
				questionIndex: index,
				userNick: user.nick
			}).forEach(function (response) {
				if ($.inArray(response.answerOptionNumber, correctAnswers) !== -1) {
					everythingWrong = false;
				} else {
					everythingRight = false;
				}
				responseAmount++;
			});
			if (responseAmount) {
				if (everythingRight && responseAmount === correctAnswers.length) {
					allCorrect++;
				}
				if (everythingWrong) {
					allWrong++;
				}
			}
		});
		return {
			allCorrect: {
				absolute: allCorrect,
				percent: memberAmount ? Math.floor((allCorrect * 100) / memberAmount) : 0
			},
			allWrong: {
				absolute: allWrong,
				percent: memberAmount ? Math.floor((allWrong * 100) / memberAmount) : 0
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
		var result = [];
		var memberAmount = ResponsesCollection.find({questionIndex: index}).fetch();
		memberAmount = _.uniq(memberAmount, false, function (user) {
			return user.userNick;
		}).length;

		var correctAnswerOptions = AnswerOptionCollection.find({
			questionIndex: index,
			isCorrect: 1
		}).count();
		AnswerOptionCollection.find({questionIndex: index}, {sort: {'answerOptionNumber': 1}}).forEach(function (value) {
			var amount = ResponsesCollection.find({
				questionIndex: index,
				answerOptionNumber: value.answerOptionNumber
			}).count();
			result.push({
				name: TAPi18n.__("view.liveResults.answer_option") + " " + String.fromCharCode(value.answerOptionNumber + 65),
				absolute: amount,
				percent: memberAmount ? (Math.floor((amount * 100) / memberAmount)) : 0,
				isCorrect: correctAnswerOptions ? value.isCorrect : -1,
				questionIndex: index
			});
		});
		return result;
	},
	isActiveQuestion: function (index) {
		let eventDoc = EventManagerCollection.findOne();
		if (!eventDoc) {
			return;
		}
		return !Session.get("sessionClosed") && index === eventDoc.questionIndex;
	},
	isRunningQuestion: ()=> {
		return Session.get("countdownInitialized");
	},
	showNextQuestionButton: ()=> {
		let eventDoc = EventManagerCollection.findOne();
		if (!eventDoc) {
			return;
		}
		return eventDoc.readingConfirmationIndex <= eventDoc.questionIndex;
	},
	nextQuestionIndex: ()=> {
		let eventDoc = EventManagerCollection.findOne();
		if (!eventDoc) {
			return;
		}
		return eventDoc.questionIndex + 2;
	},
	nextReadingConfirmationIndex: ()=> {
		let eventDoc = EventManagerCollection.findOne();
		if (!eventDoc) {
			return;
		}
		return eventDoc.readingConfirmationIndex + 2;
	},
	getCSSClassForPercent: (percent)=> {
		return hslColPerc(percent, 0, 120);
	},
	showGlobalLeaderboardButton: ()=> {
		var questionDoc = QuestionGroupCollection.findOne();
		let eventDoc = EventManagerCollection.findOne();
		if (!questionDoc || !eventDoc) {
			return;
		}

		return Session.get("sessionClosed") && questionDoc.questionList.length > 1 && eventDoc.questionIndex >= questionDoc.questionList.length - 1;
	},
	hasCorrectAnswerOptions: ()=> {
		return AnswerOptionCollection.find({isCorrect: 1}).count() > 0;
	},
	showQuestionDialog: ()=> {
		let eventDoc = EventManagerCollection.findOne();
		if (!eventDoc) {
			return;
		}

		return eventDoc.questionIndex === eventDoc.readingConfirmationIndex;
	},
	hasNextQuestion: ()=> {
		var questionDoc = QuestionGroupCollection.findOne();
		let eventDoc = EventManagerCollection.findOne();
		if (!questionDoc || !eventDoc) {
			return;
		}

		return eventDoc.questionIndex < questionDoc.questionList.length - 1;
	},
	hasReadConfirmationRequested: (index)=> {
		let eventDoc = EventManagerCollection.findOne();
		if (!eventDoc) {
			return;
		}
		return index <= eventDoc.questionIndex;
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
	isOwnNick: (nick)=> {
		return nick === localStorage.getItem(Router.current().params.quizName + "nick");
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
	},
	getCSSClassForIsCorrect: checkIfIsCorrect
});

Template.readingConfirmedLearner.helpers({
	isOwnNick: function (nickname) {
		return nickname === localStorage.getItem(Router.current().params.quizName + "nick");
	}
});

Template.gamificationAnimation.helpers({
	getCurrentAnimationSrc: function () {
		if (!Session.get("countdownInitialized") && !countdown) {
			return;
		}

		const countdownAnimationWrapper = $('#countdownAnimationWrapper');
		const countdownValue = countdown.get();

		switch (countdownValue) {
			case 0:
				if (HashtagsCollection.findOne().musicEnabled) {
					whistleSound.play();
				}
				countdownAnimationWrapper.css("background-color", "#b22222");
				break;
			case 1:
				countdownAnimationWrapper.css("background-color", "#ff8c00");
				break;
			case 2:
				countdownAnimationWrapper.css("background-color", "#ffd700");
				break;
			case 3:
				countdownAnimationWrapper.css("background-color", "#008000");
				break;
			case 4:
				countdownAnimationWrapper.css("background-color", "#2f4f4f");
				break;
			case 5:
				countdownAnimationWrapper.css("background-color", "#663399");
				break;
			default:
				countdownAnimationWrapper.hide();
				return;
		}
		countdownAnimationWrapper.fadeIn(200).delay(600).fadeOut(200);

		return "finger_" + countdownValue + ".gif";
	}
});
