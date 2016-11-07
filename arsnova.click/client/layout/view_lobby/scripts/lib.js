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
import {MemberListCollection} from '/lib/member_list/collection.js';

export let memberlistObserver = null;

export function setMaxMemberButtons(value) {
	Session.set("maxLearnerButtons", value);
}

export function calculateButtonCount(allMembersCount) {
	/*
	 This session variable determines if the user has clicked on the show-more-button. The button count must not
	 be calculated then. It is set in the event handler of the button and is reset if the user reenters the page
	 */
	if (Session.get("learnerCountOverride")) {
		setMaxMemberButtons(allMembersCount);
		return;
	}

	/*
	 To calculate the maximum output of attendee button rows we need to:
	 - get the contentPosition height (the content wrapper for all elements)
	 - subtract the confirmationCounter height (the progress bar)
	 - subtract the attendee-in-quiz-wrapper height (the session information for the attendees)
	 - subtract the margin to the top (the title or the show more button)
	 */
	var viewport = $(".contentPosition"),
		titleBar = $('.row-padding-bottom'),
		learnerListMargin = $('.learner-list').length > 0 ? parseInt($('.learner-list').first().css('margin-top').replace("px", "")) : 0;

	var viewPortHeight = viewport.height() -
		titleBar.outerHeight(true) -
		$('#waiting_for_players_notifier').outerHeight() -
		$('#attendee-in-quiz-wrapper').outerHeight(true) -
		learnerListMargin;
	$('#learner-list').height(viewPortHeight);

	/* The height of the learner button must be set manually if the html elements are not yet generated */
	var btnLearnerHeight = $('.btn-learner').first().parent().outerHeight() ? $('.btn-learner').first().parent().outerHeight() : 54;

	/* Calculate how much buttons we can place in the viewport until we need to scroll */
	var queryLimiter = Math.floor(viewPortHeight / btnLearnerHeight);

	/*
	 Multiply the displayed elements by 3 if on widescreen and reduce the max output of buttons by 1 row for the display
	 more button if necessary. Also make sure there is at least one row of buttons shown even if the user has to scroll
	 */
	var limitModifier = $(document).width() >= 992 ? 3 : $(document).width() >= 768 ? 2 : 1;

	queryLimiter *= limitModifier;
	if (queryLimiter <= 0) {
		queryLimiter = limitModifier;
	}

	/*
	 This session variable holds the amount of shown buttons and is used in the scripts function
	 Template.memberlist.scripts.learners which gets the attendees from the mongo db
	 */
	setMaxMemberButtons(queryLimiter);
	return viewPortHeight;
}

export function setMemberlistObserver(options) {
	memberlistObserver = MemberListCollection.find().observeChanges(options);
}
