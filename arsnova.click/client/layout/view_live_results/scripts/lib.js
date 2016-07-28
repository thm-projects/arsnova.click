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
import {HashtagsCollection} from '/lib/hashtags/collection.js';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {AnswerOptionCollection} from '/lib/answeroptions/collection.js';
import {MemberListCollection} from '/lib/member_list/collection.js';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import * as localData from '/lib/local_storage.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";
import {buzzsound1, whistleSound, setBuzzsound1} from '/client/plugins/sound/scripts/lib.js';

export let countdown = null;
export let routeToLeaderboardTimer = null;
let questionIndex = -1;

export function deleteCountdown() {
	if (countdown) {
		countdown.stop();
	}
	countdown = null;
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
	if (!eventDoc) {
		return false;
	}
	if (!countdown || Session.get("sessionClosed") || !Session.get("countdownInitialized") || eventDoc.questionIndex !== index) {
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
					Router.go("/" + Router.current().params.quizName + "/globalLeaderBoard");
				}
			}, 7000);
		}
		footerElements.removeFooterElement(footerElements.footerElemReadingConfirmation);
	} else {
		footerElements.addFooterElement(footerElements.footerElemReadingConfirmation, 2);
	}
	footerElements.calculateFooter();
}

export function startCountdown(index, retry = 0) {
	if (Session.get("countdownInitialized") || Session.get("sessionClosed")) {
		return;
	}
	const hashtagDoc = HashtagsCollection.findOne({hashtag: Router.current().params.quizName});
	const questionDoc = QuestionGroupCollection.findOne().questionList[index];
	if (!questionDoc) {
		if (retry < 5) {
			setTimeout(startCountdown(index, ++retry), 20);
		}
		return;
	}
	questionIndex = index;
	const currentTime = new Date();
	const timeDiff = new Date(currentTime.getTime() - questionDoc.startTime);
	console.log("Question timer: ", questionDoc.timer);
	console.log("Question startTime: ", new Date(questionDoc.startTime).toLocaleTimeString());
	console.log("Current time: ", currentTime.toLocaleTimeString());
	console.log("timeDiff: ", timeDiff.getTime() / 1000);

	if ((questionDoc.timer - (timeDiff.getTime() / 1000)) <= 0) {
		return;
	}
	if (localData.containsHashtag(Router.current().params.quizName)) {
		Meteor.call("EventManagerCollection.setActiveQuestion", Router.current().params.quizName, index);
		if (hashtagDoc.musicEnabled) {
			if (buzzsound1 == null) {
				setBuzzsound1(hashtagDoc.musicTitle);
			}
			buzzsound1.setVolume(hashtagDoc.musicVolume);
			buzzsound1.play();
			Session.set("soundIsPlaying", true);
		}
	}
	Session.set("sessionCountDown", questionDoc.timer - (timeDiff.getTime() / 1000));
	countdown = new ReactiveCountdown(questionDoc.timer - (timeDiff.getTime() / 1000));

	countdown.start(function () {
		countdownFinish();
	});
	$('.navbar-fixed-bottom').hide();
	Session.set("countdownInitialized", true);
	$('.disableOnActiveCountdown').attr("disabled", "disabled");
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
