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

import {Tracker} from 'meteor/tracker';
import {Router} from 'meteor/iron:router';
import * as memberlistLib from '/client/layout/view_lobby/scripts/lib.js';
import * as liveresultsLib from '/client/layout/view_live_results/scripts/lib.js';
import * as votingViewLib from '/client/layout/view_voting/scripts/lib.js';
import * as leaderboardLib from '/client/layout/view_leaderboard/scripts/lib.js';
import * as themeLib from '/client/layout/view_theme_switcher/scripts/lib.js';
import * as chooseNickView from '/client/layout/view_choose_nickname/scripts/lib.js';

export function isEditingQuestion() {
	switch (Router.current().route.getName()) {
		case ":quizName.question":
		case ":quizName.answeroptions":
		case ":quizName.settimer":
		case ":quizName.quizSummary":
			return true;
		default:
			return false;
	}
}

export function calculateHeaderSize() {
	return new Promise(function (resolve) {
		const header = $('.navbar-fixed-top'),
			headerTitle = header.find('.header-title'),
			titel = headerTitle.text().trim(),
			titleLength = titel.length;

		let fontSize = "",
			logoHeight;

		if ($(document).width() > $(document).height()) {
			logoHeight = $(window).width() * 0.08;
		} else {
			logoHeight = $(window).height() * 0.08;
		}
		header.find('#arsnova-logo-image').css("height", logoHeight);

		if (titleLength <= 15) {
			if ($(document).width() > $(document).height()) {
				if ($(document).width() < 1200) {
					fontSize = "6vw";
				} else {
					fontSize = "5vw";
				}
			} else {
				fontSize = "5vmin";
			}
		} else if (titleLength <= 20) {
			if ($(document).width() > $(document).height()) {
				fontSize = "5.5vw";
			} else {
				fontSize = "4vh";
			}
		} else {
			if ($(document).width() > $(document).height()) {
				fontSize = "4vw";
			} else {
				fontSize = "3vh";
			}
		}
		headerTitle.css({"font-size": fontSize, "line-height": header.find('#arsnova-logo-image').css("height")});
		resolve();
	});
}

export const titelTracker = new Tracker.Dependency();
export function calculateTitelHeight() {
	return new Promise(function (resolve) {
		const fixedTop = $(".navbar-fixed-top"),
			fixedBottom = $('.navbar-fixed-bottom'),
			container = $(".container"),
			rowBottom = $('.row-padding-bottom'),
			centerVertical = $('.center-vertical'),
			footerHeight = $(".fixed-bottom").outerHeight(true) + $(".footer-info-bar").outerHeight(),
			navbarFooterHeight = fixedBottom.is(":visible") ? fixedBottom.outerHeight() : 0,
			marginTop = rowBottom.outerHeight(true) || fixedTop.outerHeight(),
			finalHeight = $(window).height() - marginTop - navbarFooterHeight - footerHeight;

		let centerVerticalTop = finalHeight / 2 - centerVertical.outerHeight() / 2;
		if (centerVerticalTop < 0) {
			centerVerticalTop = 0;
		}

		$('.titel').css('margin-top', fixedTop.outerHeight() * 1.1);
		container.css("height", finalHeight);
		container.css("margin-top", !rowBottom.outerHeight() ? marginTop : 0);
		centerVertical.css("top", centerVerticalTop);
		if ($(window).height() < 768) {
			centerVertical.css({width: "100%", margin: "0 -15px"});
		}
		titelTracker.changed();
		resolve();
	});
}

export const headerTrackerCallback = function () {
	memberlistLib.memberlistTracker.depend();
	liveresultsLib.liveResultsTracker.depend();
	votingViewLib.votingViewTracker.depend();
	leaderboardLib.leaderboardTracker.depend();
	themeLib.themeTracker.depend();
	chooseNickView.nickTracker.depend();
	calculateHeaderSize();
	calculateTitelHeight();
};
