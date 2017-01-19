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
import {Router} from 'meteor/iron:router';
import {TAPi18n} from 'meteor/tap:i18n';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {AnswerOptionCollection} from '/lib/answeroptions/collection.js';
import {MemberListCollection} from '/lib/member_list/collection.js';
import {ResponsesCollection} from '/lib/responses/collection.js';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {SessionConfigurationCollection} from '/lib/session_configuration/collection.js';
import * as localData from '/lib/local_storage.js';
import * as leaderboardLib from '/client/layout/view_leaderboard/scripts/lib.js';
import * as questionLib from '/client/layout/view_questions/scripts/lib.js';
import * as lib from './lib.js';

Template.liveResultsFooterNavButtons.helpers({
	isOwner: function () {
		return localData.containsHashtag(Router.current().params.quizName);
	},
	isRunningQuestion: ()=> {
		return Session.get("countdownInitialized");
	},
	showGlobalLeaderboardButton: ()=> {
		const questionDoc = QuestionGroupCollection.findOne();
		let eventDoc = EventManagerCollection.findOne();
		if (!questionDoc || !eventDoc) {
			return;
		}

		return lib.countdown === null && questionDoc.questionList.length > 1 && eventDoc.questionIndex >= questionDoc.questionList.length - 1;
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
		const questionDoc = QuestionGroupCollection.findOne();
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
		const doc = QuestionGroupCollection.findOne();
		return doc ? doc.questionList.length : false;
	},
	hasOnlyOneQuestion: ()=> {
		const questionDoc = QuestionGroupCollection.findOne();
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
		return ResponsesCollection.find({questionIndex: eventDoc.questionIndex}).fetch().length;
	},
	getCountdown: function () {
		if (Session.get("countdownInitialized")) {
			const roundedCountdown = Math.round(lib.countdown.get());
			return roundedCountdown < 0 ? 0 : roundedCountdown;
		}
		return 0;
	},
	votingText: function () {
		return Session.get("sessionClosed") ? "view.liveResults.game_over" : "view.liveResults.countdown";
	},
	showResponseProgress: function () {
		const sessionConfig = SessionConfigurationCollection.findOne();
		if (!sessionConfig) {
			return;
		}
		return sessionConfig.showResponseProgress;
	},
	isRunningQuestion: ()=> {
		return Session.get("countdownInitialized");
	}
});

Template.progressBarSingleChoiceQuestion.helpers({
	answerList: function (index) {
		const result = [];
		const hashtag = Router.current().params.quizName;
		const responseSet = ResponsesCollection.find({hashtag: hashtag, questionIndex: index});
		const memberAmount = responseSet.collection.find({hashtag: hashtag, questionIndex: index}).count();

		const allAnswerOptions = AnswerOptionCollection.find({
			hashtag: hashtag,
			questionIndex: index
		}, {sort: {answerOptionNumber: 1}});
		const correctAnswerOptions = allAnswerOptions.collection.find({hashtag: hashtag, isCorrect: true}).count();

		allAnswerOptions.forEach(function (value) {
			const amount = responseSet.collection.find({
				hashtag: hashtag,
				questionIndex: index,
				answerOptionNumber: value.answerOptionNumber
			}).count();
			const answerTextValue = [value.answerText.replace(/\$\$/g, '$')];
			questionLib.parseGithubFlavoredMarkdown(answerTextValue);
			result.push({
				name: String.fromCharCode(value.answerOptionNumber + 65) + ": " + answerTextValue[0],
				absolute: amount,
				percent: memberAmount ? (Math.floor((amount * 100) / memberAmount)) : 0,
				isCorrect: correctAnswerOptions ? value.isCorrect : -1,
				questionIndex: index,
				backgroundClass: lib.getProgressbarCSSClass(index, lib.checkIfIsCorrect(correctAnswerOptions ? value.isCorrect : -1))
			});
		});
		return result;
	}
});

Template.progressBarSurveyQuestion.helpers({
	answerList: function (index) {
		const result = [];
		const hashtag = Router.current().params.quizName;
		const responseSet = ResponsesCollection.find({hashtag: hashtag, questionIndex: index});
		const memberAmount = responseSet.collection.find({hashtag: hashtag, questionIndex: index}).count();

		const allAnswerOptions = AnswerOptionCollection.find({
			hashtag: hashtag,
			questionIndex: index
		}, {sort: {answerOptionNumber: 1}});

		allAnswerOptions.forEach(function (value) {
			const amount = responseSet.collection.find({
				hashtag: hashtag,
				questionIndex: index,
				answerOptionNumber: value.answerOptionNumber
			}).count();
			const answerTextValue = [value.answerText.replace(/\$\$/g, '$')];
			questionLib.parseGithubFlavoredMarkdown(answerTextValue);
			result.push({
				name: String.fromCharCode(value.answerOptionNumber + 65) + ": " + answerTextValue[0],
				absolute: amount,
				percent: memberAmount ? (Math.floor((amount * 100) / memberAmount)) : 0,
				isCorrect: 0,
				questionIndex: index,
				backgroundClass: "progress-default"
			});
		});
		return result;
	}
});

Template.progressBarMultipleChoiceQuestion.helpers({
	answerList: function (index) {
		const result = [];
		const hashtag = Router.current().params.quizName;
		const responses = ResponsesCollection.find({questionIndex: index});
		const memberAmount = responses.collection.find({hashtag: hashtag, questionIndex: index}).count();
		if (lib.isCountdownZero(index)) {
			let allCorrect = 0;
			let partiallyCorrect = 0;
			let allWrong = 0;
			const question = QuestionGroupCollection.findOne({hashtag: hashtag}).questionList[index];
			responses.forEach(function (responseItem) {
				const correctResponse = leaderboardLib.isCorrectResponse(responseItem, question, index);
				if (correctResponse === -1) {
					allWrong++;
				} else if (correctResponse === 0) {
					partiallyCorrect++;
				} else {
					allCorrect++;
				}
			});
			result.push({
				name: TAPi18n.__("view.liveResults.complete_correct"),
				absolute: allCorrect,
				percent: memberAmount ? Math.floor((allCorrect * 100) / memberAmount) : 0,
				id: 0,
				isCorrect: 1,
				backgroundClass: lib.getProgressbarCSSClass(index, lib.checkIfIsCorrect(1))
			});
			result.push({
				name: TAPi18n.__("view.liveResults.partially_correct"),
				absolute: partiallyCorrect,
				percent: memberAmount ? Math.floor((partiallyCorrect * 100) / memberAmount) : 0,
				id: 1,
				isCorrect: -1,
				backgroundClass: lib.getProgressbarCSSClass(index, lib.checkIfIsCorrect(-1))
			});
			result.push({
				name: TAPi18n.__("view.liveResults.complete_wrong"),
				absolute: allWrong,
				percent: memberAmount ? Math.floor((allWrong * 100) / memberAmount) : 0,
				id: 2,
				isCorrect: 0,
				backgroundClass: lib.getProgressbarCSSClass(index, lib.checkIfIsCorrect(0))
			});
		} else {
			const allAnswerOptions = AnswerOptionCollection.find({
				hashtag: hashtag,
				questionIndex: index
			}, {sort: {answerOptionNumber: 1}});
			const correctAnswerOptions = allAnswerOptions.collection.find({hashtag: hashtag, isCorrect: true}).count();
			allAnswerOptions.forEach(function (value) {
				const amount = responses.collection.find({
					hashtag: hashtag,
					questionIndex: index,
					answerOptionNumber: value.answerOptionNumber
				}).count();
				const answerTextValue = [value.answerText.replace(/\$\$/g, '$')];
				questionLib.parseGithubFlavoredMarkdown(answerTextValue);
				result.push({
					name: String.fromCharCode(value.answerOptionNumber + 65) + ": " + answerTextValue[0],
					absolute: amount,
					percent: memberAmount ? (Math.floor((amount * 100) / memberAmount)) : 0,
					isCorrect: correctAnswerOptions ? value.isCorrect : -1,
					questionIndex: index,
					backgroundClass: lib.getProgressbarCSSClass(index, lib.checkIfIsCorrect(correctAnswerOptions ? value.isCorrect : -1))
				});
			});
		}
		return result;
	}
});

Template.progressBarFreeTextQuestion.helpers({
	answerList: function (index) {
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
				name: TAPi18n.__("view.liveResults.correct"),
				absolute: correctAnswerCount,
				percent: memberAmount ? Math.floor((correctAnswerCount * 100) / memberAmount) : 0,
				backgroundClass: lib.getProgressbarCSSClass(index, lib.checkIfIsCorrect(1))
			},
			wrong: {
				name: TAPi18n.__("view.liveResults.wrong"),
				absolute: wrongAnswerCount,
				percent: memberAmount ? Math.floor((wrongAnswerCount * 100) / memberAmount) : 0,
				backgroundClass: lib.getProgressbarCSSClass(index, lib.checkIfIsCorrect(0))
			}
		};
	}
});

Template.progressBarRangedQuestion.helpers({
	answerList: function (index) {
		const questionGroup = QuestionGroupCollection.findOne({hashtag: Router.current().params.quizName});
		if (!questionGroup) {
			return null;
		}
		let inCorrectRange = 0;
		let inWrongRange = 0;
		const question = questionGroup.questionList[index];
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
				name: TAPi18n.__("view.liveResults.guessed_correct"),
				absolute: inCorrectRange,
				percent: memberAmount ? Math.floor((inCorrectRange * 100) / memberAmount) : 0,
				backgroundClass: lib.getProgressbarCSSClass(index, lib.checkIfIsCorrect(1))
			},
			allWrong: {
				name: TAPi18n.__("view.liveResults.guessed_wrong"),
				absolute: inWrongRange,
				percent: memberAmount ? Math.floor((inWrongRange * 100) / memberAmount) : 0,
				backgroundClass: lib.getProgressbarCSSClass(index, lib.checkIfIsCorrect(0))
			}
		};
	}
});

Template.liveResults.helpers({
	getProgressbarTemplate: function (index) {
		const questionDoc = QuestionGroupCollection.findOne({hashtag: Router.current().params.quizName});
		if (typeof index === "undefined" || !questionDoc) {
			return null;
		}
		switch (questionDoc.questionList[index].type) {
			case "SingleChoiceQuestion":
			case "YesNoSingleChoiceQuestion":
			case "TrueFalseSingleChoiceQuestion":
				return "progressBarSingleChoiceQuestion";
			case "SurveyQuestion":
				return "progressBarSurveyQuestion";
			case "MultipleChoiceQuestion":
				return "progressBarMultipleChoiceQuestion";
			case "RangedQuestion":
				return "progressBarRangedQuestion";
			case "FreeTextQuestion":
				return "progressBarFreeTextQuestion";
		}
	},
	isCountdownZero: function (index) {
		return lib.isCountdownZero(index);
	},
	getPercentRead: (index)=> {
		return lib.getPercentRead(index);
	},
	getCurrentRead: (index)=> {
		const sessionConfig = SessionConfigurationCollection.findOne({hashtag: Router.current().params.quizName});
		if (!sessionConfig) {
			return;
		}
		const currentReadAmount = lib.getCurrentRead(index);
		if (currentReadAmount > 0 || sessionConfig.readingConfirmationEnabled === false) {
			$('#startNextQuestion').removeAttr('disabled');
		}
		return currentReadAmount;
	},
	showLeaderBoardButton: function (index) {
		const questionDoc = QuestionGroupCollection.findOne();
		const eventDoc = EventManagerCollection.findOne();
		if (!questionDoc) {
			return;
		}

		if (Session.get("countdownInitialized")) {
			return questionDoc.questionList[index].type !== "SurveyQuestion" && index < eventDoc.questionIndex;
		} else {
			return questionDoc.questionList[index].type !== "SurveyQuestion" && index <= eventDoc.questionIndex;
		}
	},
	getNormalizedIndex: function (index) {
		return index + 1;
	},
	allQuestionCount: function () {
		const questionDoc = QuestionGroupCollection.findOne();
		return questionDoc ? questionDoc.questionList.length : false;
	},
	showResponseProgress: function () {
		const sessionConfig = SessionConfigurationCollection.findOne();
		if (!sessionConfig) {
			return;
		}
		return sessionConfig.showResponseProgress || !Session.get("countdownInitialized");
	},
	questionList: function () {
		let eventDoc = EventManagerCollection.findOne();
		let questionDoc = QuestionGroupCollection.findOne();
		if (!eventDoc || !questionDoc) {
			return;
		}

		if (eventDoc.readingConfirmationIndex < questionDoc.questionList.length - 1) {
			questionDoc.questionList.splice(eventDoc.readingConfirmationIndex + 1, questionDoc.questionList.length - (eventDoc.readingConfirmationIndex + 1));
		}

		for (let i = 0; i < questionDoc.questionList.length; i++) {
			questionDoc.questionList[i].displayIndex = i;
		}

		if (Session.get("countdownInitialized") || (lib.countdown && lib.countdown.get() > 0)) {
			return [questionDoc.questionList[eventDoc.questionIndex]];
		}
		return questionDoc.questionList ? questionDoc.questionList.reverse() : false;
	},
	hasOnlyOneQuestion: ()=> {
		let questionDoc = QuestionGroupCollection.findOne();
		if (!questionDoc) {
			return;
		}
		return questionDoc.questionList.length === 1;
	},
	isReadingConfirmationEnabled: ()=> {
		const sessionConfig = SessionConfigurationCollection.findOne();
		if (!sessionConfig) {
			return;
		}
		return sessionConfig.readingConfirmationEnabled;
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
		const result = [];
		MemberListCollection.find().forEach(function (doc) {
			if (doc.readConfirmed[index]) {
				result.push(doc);
			}
		});
		return ((result.length - Session.get("LearnerCount")) > 1);
	},
	invisibleLearnerCount: function (index) {
		const result = [];
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

		if (!Session.get("countdownInitialized") || !lib.countdown) {
			if (!countdownAnimationWrapper.is(":hidden")) {
				countdownAnimationWrapper.fadeOut();
			}
			return;
		}

		const countdownValue = lib.countdown.get();

		if (countdownValue <= 6) {
			lib.setQuestionDialog(null);
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
