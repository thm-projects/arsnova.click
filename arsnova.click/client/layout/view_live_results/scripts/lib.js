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
import {SessionConfigurationCollection} from '/lib/session_configuration/collection.js';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {AnswerOptionCollection} from '/lib/answeroptions/collection.js';
import {MemberListCollection} from '/lib/member_list/collection.js';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {RangedQuestion} from "/lib/questions/question_ranged.js";
import {FreeTextQuestion} from "/lib/questions/question_freetext.js";
import * as localData from '/lib/local_storage.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";
import {Splashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import {buzzsound1, whistleSound, setBuzzsound1} from '/client/plugins/sound/scripts/lib.js';

export let countdown = null;
export let routeToLeaderboardTimer = null;
export let questionDialog = null;
let questionIndex = -1;

export function deleteCountdown() {
	if (countdown) {
		countdown.stop();
	}
	countdown = null;
}

export function setQuestionDialog(instance) {
	if (questionDialog instanceof Splashscreen) {
		questionDialog.close();
	}
	questionDialog = instance;
}

/**
 * @source http://stackoverflow.com/a/17267684
 */
export function hslColPerc(percent, start, end) {
	var a = percent / 100, b = end * a, c = b + start;
	return 'hsl(' + c + ',100%,25%)';
}

export function isCountdownZero(index) {
	let eventDoc = EventManagerCollection.findOne();
	if (!eventDoc || Session.get("isQueringServerForTimeStamp")) {
		return false;
	}
	if (!countdown || countdown.get() === 0 || Session.get("sessionClosed") || !Session.get("countdownInitialized") || eventDoc.questionIndex !== index) {
		return true;
	} else {
		var timer = Math.round(countdown.get());
		return timer <= 0;
	}
}

export function getPercentRead(index) {
	var sumRead = 0;
	var count = 0;
	MemberListCollection.find().map(function (member) {
		count++;
		if (member.readConfirmed[index]) {
			sumRead += member.readConfirmed[index];
		}
	});
	return count ? Math.floor(sumRead / count * 100) : 0;
}

export function getCurrentRead(index) {
	var sumRead = 0;
	MemberListCollection.find().map(function (member) {
		if (member.readConfirmed[index]) {
			sumRead += member.readConfirmed[index];
		}
	});
	return sumRead;
}

export function checkIfIsCorrect(isCorrect) {
	return isCorrect > 0 ? 'progress-success' : isCorrect < 0 ? 'progress-default' : 'progress-failure';
}

export function countdownFinish() {
	setQuestionDialog(null);
	Session.set("countdownInitialized", false);
	deleteCountdown();
	$('.disableOnActiveCountdown').removeAttr("disabled");
	if (!localData.containsHashtag(Router.current().params.quizName)) {
		return;
	}
	$('.navbar-fixed-bottom').show();
	if (Session.get("soundIsPlaying")) {
		buzzsound1.stop();
		whistleSound.play();
		Session.set("soundIsPlaying", false);
	}
	if (questionIndex + 1 >= QuestionGroupCollection.findOne().questionList.length) {
		Session.set("sessionClosed", true);
		if (localData.containsHashtag(Router.current().params.quizName) && AnswerOptionCollection.find({isCorrect: true}).count() > 0) {
			routeToLeaderboardTimer = setTimeout(() => {
				// don't reroute if the instructor already moved
				var currentRoute = Router.current().route.getName().replace(":quizName.", "");
				if (currentRoute === "results") {
					Router.go("/" + Router.current().params.quizName + "/leaderBoard/all");
				}
			}, 7000);
		}
		footerElements.removeFooterElement(footerElements.footerElemReadingConfirmation);
	} else {
		footerElements.addFooterElement(footerElements.footerElemReadingConfirmation, 2);
	}
	footerElements.calculateFooter();
}

/**
 * @see http://stackoverflow.com/a/7228322
 * @param min Minimum range
 * @param max Maximum range
 * @returns {number} A random integer between min and max
 */
export function randomIntFromInterval(min,max)
{
	return Math.floor(Math.random() * (max - min + 1) + min);
}

export function startCountdown(index, retry = 0) {
	if (Session.get("countdownInitialized") || Session.get("sessionClosed")) {
		Session.set("isQueringServerForTimeStamp", false);
		return;
	}
	Session.set("isQueringServerForTimeStamp", true);
	const questionDoc = QuestionGroupCollection.findOne().questionList[index];
	const configDoc = SessionConfigurationCollection.findOne({hashtag: Router.current().params.quizName});
	if (!questionDoc) {
		if (retry < 5) {
			setTimeout(startCountdown(index, ++retry), 20);
		}
		Session.set("isQueringServerForTimeStamp", false);
		return;
	}
	questionIndex = index;
	Meteor.call("Main.getCurrentTimeStamp", function (error, response) {
		const currentTime = new Date(response);
		const timeDiff = new Date(currentTime.getTime() - questionDoc.startTime);

		if ((questionDoc.timer - (timeDiff.getTime() / 1000)) <= 0) {
			Session.set("isQueringServerForTimeStamp", false);
			return;
		}
		if (localData.containsHashtag(Router.current().params.quizName)) {
			Meteor.call("EventManagerCollection.setActiveQuestion", Router.current().params.quizName, index);
			if (configDoc.music.isEnabled) {
				if (buzzsound1 == null) {
					setBuzzsound1(configDoc.music.title);
				}
				buzzsound1.setVolume(configDoc.music.volume);
				buzzsound1.play();
				Session.set("soundIsPlaying", true);
			}
		}
		const countdownValue = Math.round(questionDoc.timer - (timeDiff.getTime() / 1000));
		Session.set("sessionCountDown", countdownValue);
		countdown = new ReactiveCountdown(countdownValue);

		countdown.start(function () {
			if (countdown && countdown.get() === 0) {
				countdownFinish();
			}
		});
		$('.navbar-fixed-bottom').hide();
		Session.set("isQueringServerForTimeStamp", false);
		Session.set("countdownInitialized", true);
		$('.disableOnActiveCountdown').attr("disabled", "disabled");

		if (!localData.containsHashtag(Router.current().params.quizName)) {
			return;
		}
		const debugMembers = MemberListCollection.find({nick: {$regex: "debug_user_*", $options: "i"}}).fetch();
		debugMembers.forEach(function (member) {
			const replyTimer = randomIntFromInterval(0, countdownValue - 1);
			if (replyTimer >= countdownValue) {
				return;
			}
			const question = Session.get("questionGroup").getQuestionList()[EventManagerCollection.findOne().questionIndex];
			setTimeout(function () {
				const configObj = {
					hashtag: Router.current().params.quizName,
					questionIndex: EventManagerCollection.findOne().questionIndex,
					userNick: member.nick
				};
				if (question instanceof RangedQuestion) {
					configObj.rangedInputValue = Math.random() > 0.6 ? Session.get("questionGroup").getQuestionList()[EventManagerCollection.findOne().questionIndex].getCorrectValue() : Session.get("questionGroup").getQuestionList()[EventManagerCollection.findOne().questionIndex].getMaxRange() + 10;
					Meteor.call('ResponsesCollection.addResponse', configObj);
				} else if (question instanceof FreeTextQuestion) {
					configObj.freeTextInputValue = Math.random() > 0.75 ? Session.get("questionGroup").getQuestionList()[EventManagerCollection.findOne().questionIndex].getAnswerOptionList()[0].getAnswerText() : Session.get("questionGroup").getQuestionList()[EventManagerCollection.findOne().questionIndex].getAnswerOptionList()[0].getAnswerText().split("").reverse().join("");
					configObj.answerOptionNumber = 0;
					Meteor.call('ResponsesCollection.addResponse', configObj);
				} else {
					const randomChance = Math.random();
					if (Session.get("questionGroup").getQuestionList()[EventManagerCollection.findOne().questionIndex].typeName() === "SingleChoiceQuestion") {
						if (randomChance > 0.75) {
							Session.get("questionGroup").getQuestionList()[EventManagerCollection.findOne().questionIndex].getAnswerOptionList().forEach(function (answerItem) {
								if (answerItem.getIsCorrect()) {
									configObj.answerOptionNumber = answerItem.getAnswerOptionNumber();
									Meteor.call('ResponsesCollection.addResponse', configObj);
								}
							});
						} else if (randomChance > 0.25 && randomChance <= 0.75) {
							if (Math.random() > 0.5) {
								Session.get("questionGroup").getQuestionList()[EventManagerCollection.findOne().questionIndex].getAnswerOptionList().forEach(function (answerItem) {
									if (answerItem.getIsCorrect()) {
										configObj.answerOptionNumber = answerItem.getAnswerOptionNumber();
										Meteor.call('ResponsesCollection.addResponse', configObj);
									}
								});
							} else {
								let hasAnswered = false;
								Session.get("questionGroup").getQuestionList()[EventManagerCollection.findOne().questionIndex].getAnswerOptionList().forEach(function (answerItem) {
									if (!answerItem.getIsCorrect() && !hasAnswered) {
										hasAnswered = true;
										configObj.answerOptionNumber = answerItem.getAnswerOptionNumber();
										Meteor.call('ResponsesCollection.addResponse', configObj);
									}
								});
							}
						} else {
							let hasAnswered = false;
							Session.get("questionGroup").getQuestionList()[EventManagerCollection.findOne().questionIndex].getAnswerOptionList().forEach(function (answerItem) {
								if (!answerItem.getIsCorrect() && !hasAnswered) {
									hasAnswered = true;
									configObj.answerOptionNumber = answerItem.getAnswerOptionNumber();
									Meteor.call('ResponsesCollection.addResponse', configObj);
								}
							});
						}
					} else {
						if (randomChance > 0.75) {
							Session.get("questionGroup").getQuestionList()[EventManagerCollection.findOne().questionIndex].getAnswerOptionList().forEach(function (answerItem) {
								if (answerItem.getIsCorrect()) {
									configObj.answerOptionNumber = answerItem.getAnswerOptionNumber();
									Meteor.call('ResponsesCollection.addResponse', configObj);
								}
							});
						} else if (randomChance > 0.25 && randomChance <= 0.75) {
							Session.get("questionGroup").getQuestionList()[EventManagerCollection.findOne().questionIndex].getAnswerOptionList().forEach(function (answerItem) {
								if (Math.random() > 0.5) {
									if (answerItem.getIsCorrect()) {
										configObj.answerOptionNumber = answerItem.getAnswerOptionNumber();
										Meteor.call('ResponsesCollection.addResponse', configObj);
									}
								} else {
									configObj.answerOptionNumber = answerItem.getAnswerOptionNumber();
									Meteor.call('ResponsesCollection.addResponse', configObj);
								}
							});
						} else {
							Session.get("questionGroup").getQuestionList()[EventManagerCollection.findOne().questionIndex].getAnswerOptionList().forEach(function (answerItem) {
								if (!answerItem.getIsCorrect()) {
									configObj.answerOptionNumber = answerItem.getAnswerOptionNumber();
									Meteor.call('ResponsesCollection.addResponse', configObj);
								}
							});
						}
					}
				}
			}, replyTimer * 1000);
		});
	});
}

/**
 * TODO remove this function with the Meteor 1.3 update and replace with an import from the memberList!
 */
export function calculateButtonCount() {
	/*
	 This session variable determines if the user has clicked on the show-more-button. The button count must not
	 be calculated then. It is set in the event handler of the button and is reset if the user reenters the page
	 */
	if (Session.get("LearnerCountOverride")) {
		return;
	}

	/*
	 To calculate the maximum output of attendee button rows we need to:
	 - get the contentPosition height (the content wrapper for all elements)
	 - subtract the confirmationCounter height (the progress bar)
	 - subtract the attendee-in-quiz-wrapper height (the session information for the attendees)
	 - subtract the margin to the top (the title or the show more button)
	 */
	var viewport = $(".contentPosition"), learnerListMargin = $('.learner-list').length > 0 ? parseInt($('.learner-list').first().css('margin-top').replace("px", "")) : 0;

	var viewPortHeight = viewport.outerHeight() - $('.question-title').outerHeight(true) - $('.readingConfirmationProgressRow').outerHeight(true) - $('.btn-more-learners').outerHeight(true) - learnerListMargin;

	/* The height of the learner button must be set manually if the html elements are not yet generated */
	var btnLearnerHeight = $('.btn-learner').first().parent().outerHeight() ? $('.btn-learner').first().parent().outerHeight() : 54;

	/* Calculate how much buttons we can place in the viewport until we need to scroll */
	var queryLimiter = Math.floor(viewPortHeight / btnLearnerHeight);

	/*
	 Multiply the displayed elements by 3 if on widescreen and reduce the max output of buttons by 1 row for the display
	 more button if necessary. Also make sure there is at least one row of buttons shown even if the user has to scroll
	 */
	var allMembers = [];
	MemberListCollection.find().forEach(function (doc) {
		if (doc.readConfirmed[EventManagerCollection.findOne().readingConfirmationIndex]) {
			allMembers.push(doc);
		}
	});
	var limitModifier = (viewport.outerWidth() >= 992) ? 3 : (viewport.outerWidth() >= 768 && viewport.outerWidth() < 992) ? 2 : 1;

	queryLimiter *= limitModifier;
	if (queryLimiter <= 0) {
		queryLimiter = limitModifier;
	} else if (allMembers > queryLimiter) {
		/*
		 Use Math.ceil() as a session owner because the member buttons position may conflict with the back/forward buttons position.
		 As a session attendee we do not have these buttons, so we can use Math.floor() to display a extra row
		 */
		if ($(".fixed-bottom").length > 0) {
			queryLimiter -= Math.ceil($('.more-learners-row').first().outerHeight() / btnLearnerHeight) * limitModifier;
		} else {
			queryLimiter -= Math.floor($('.more-learners-row').first().outerHeight() / btnLearnerHeight) * limitModifier;
		}
	}

	/*
	 This session variable holds the amount of shown buttons and is used in the scripts function
	 Template.memberlist.scripts.learners which gets the attendees from the mongo db
	 */
	Session.set("LearnerCount", queryLimiter);
}
