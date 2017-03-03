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
import {ResponsesCollection} from '/lib/responses/collection.js';

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
	const viewport = $('.contentPosition');

	const viewPortHeight = viewport.outerHeight();

	/* The height of the learner button must be set manually if the html elements are not yet generated */
	const btnLearnerHeight = $('.button-leader').first().parent().outerHeight(true) ? $('.button-leader').first().parent().outerHeight(true) : 60;

	/* Calculate how much buttons we can place in the viewport until we need to scroll */
	let queryLimiter = Math.floor(viewPortHeight / btnLearnerHeight);

	/*
	 Multiply the displayed elements by 2 if on widescreen and reduce the max output of buttons by 1 row for the display
	 more button if necessary. Also make sure there is at least one row of buttons shown even if the user has to scroll
	 */
	const limitModifier = viewport.outerWidth() >= 768 ? 2 : 1;

	queryLimiter *= limitModifier;
	if (queryLimiter <= 0) {
		queryLimiter = limitModifier;
	}
	if (limitModifier === 2) {
		queryLimiter--;
	}

	/*
	 This variable holds the amount of shown buttons and is used in the scripts functions
	 */
	setMaxResponseButtons(queryLimiter);
}

function generateCSVExportData() {
	const items = Session.get("exportItems");
	let csvString = "";
	let hasIdentifiedUsers = false;
	items.forEach(function (item) {
		const response = ResponsesCollection.findOne({hashtag: Router.current().params.quizName, userNick: item.nick}, {userRef: 1});
		if (typeof response.profile !== "undefined") {
			response.profile = $.parseJSON(response.profile);
			hasIdentifiedUsers = true;
			item.id      = response.profile.id;
			item.mail    = response.profile.mail instanceof Array ? response.profile.mail.join(", ") : response.profile.mail;
			csvString += item.nick + ";" + item.responseTime + ";" + item.correctQuestions.join(", ") + ";" + item.id + ";" + item.mail + "\n";
		} else {
			csvString += item.nick + ";" + item.responseTime + ";" + item.correctQuestions.join(", ") + "\n";
		}
	});
	const csvHeader = hasIdentifiedUsers ? "Nickname;ResponseTime (ms);Correct question numbers;UserID,Email\n" : "Nickname;ResponseTime (ms);Correct question numbers\n";
	return csvHeader + csvString;
}

export function generateExportData(type = "csv") {
	switch (type) {
		case "csv":
			return generateCSVExportData();
	}
}
