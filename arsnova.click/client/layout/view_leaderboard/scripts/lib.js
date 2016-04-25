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
import {EventManager} from '/lib/eventmanager.js';
import {AnswerOptions} from '/lib/answeroptions.js';
import {MemberList} from '/lib/memberlist.js';
import {Responses} from '/lib/responses.js';

export function setMaxResponseButtons(value) {
    Session.set("maxResponseButtons", value);
}

export function calculateButtonCount (allMembersCount) {

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
        appTitle = $('#appTitle');

    var viewPortHeight = viewport.outerHeight() - appTitle.outerHeight();

    /* The height of the learner button must be set manually if the html elements are not yet generated */
    var btnLearnerHeight = $('.button-leader').first().parent().outerHeight(true) ? $('.button-leader').first().parent().outerHeight(true) : 70;

    /* Calculate how much buttons we can place in the viewport until we need to scroll */
    var queryLimiter = Math.floor(viewPortHeight / btnLearnerHeight);
    queryLimiter--;

    /*
     Multiply the displayed elements by 2 if on widescreen and reduce the max output of buttons by 1 row for the display
     more button if necessary. Also make sure there is at least one row of buttons shown even if the user has to scroll
     */
    var limitModifier = viewport.outerWidth() >= 768 ? 2 : 1;

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
	var param = {isCorrect: 1};
	param.questionIndex = index;
	var rightAnswerOptions = AnswerOptions.find(param);
	delete param.isCorrect;

	MemberList.find({}, {fields: {nick: 1}}).forEach(function (member) {
		param.userNick = member.nick;
		var userResponses = Responses.find(param);
		delete param.userNick;
		var userHasRightAnswers = true;
		// only put member in leaderboard when he clicked the right amount, then check whether he clicked all the right ones
		var totalResponseTime = 0;
		if ((userResponses.count() === rightAnswerOptions.count()) && (userResponses.count() > 0) && userHasRightAnswers) {
			userResponses.forEach(function (userResponse) {
				param.isCorrect = 1;
				param.answerOptionNumber = userResponse.answerOptionNumber;
				var checkAnswerOptionDoc = AnswerOptions.findOne(param);
				delete param.isCorrect;
				delete param.answerOptionNumber;
				if (!checkAnswerOptionDoc) {
					userHasRightAnswers = false;
				} else {
					totalResponseTime += userResponse.responseTime;
				}
			});
			if (userHasRightAnswers) {
				allGoodMembers.push({
					nick: member.nick,
					responseTime: totalResponseTime / rightAnswerOptions.count()
				});
			}
		}
	});

    Session.set("allMembersCount",allGoodMembers.length);
    calculateButtonCount (allGoodMembers.length);
    return _.sortBy(allGoodMembers, 'responseTime').slice(0, Session.get("maxResponseButtons"));
}

export function getLeaderBoardItems () {
    if (typeof Session.get("showLeaderBoardId") !== "undefined") {
        return [{value: getLeaderBoardItemsByIndex(Session.get("showLeaderBoardId"))}];
    } else {
        if (!EventManager.findOne()) {
            return [];
        }

        var result = [];
        for (var i = 0; i <= EventManager.findOne().questionIndex; i++) {
            result.push({
                index: i,
                value: getLeaderBoardItemsByIndex(i)
            });
        }

        return result;
    }
}