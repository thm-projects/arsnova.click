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
import {getLeaderBoardItems, getAllNicksWhichAreAlwaysRight} from './lib.js';

Template.leaderBoard.helpers({
	hashtag: ()=> {
		return Router.current().params.quizName;
	},
	getNormalizedIndex: (index)=> {
		return index + 1;
	},
	isNumber: (index)=> {
		return !isNaN(index);
	},
	isOwnNick: (nick) => {
		return nick === localStorage.getItem(Router.current().params.quizName + "nick");
	},
	getTitleText: ()=> {
		if (Session.get("showGlobalRanking")) {
			return TAPi18n.__("view.leaderboard.title.all_questions");
		} else {
			return TAPi18n.__("view.leaderboard.title.single_question", {questionId: (Session.get("showLeaderBoardId") + 1)});
		}
	},
	getPosition: function (index) {
		return (index + 1);
	},
	parseTimeToSeconds: function (milliseconds) {
		let seconds = String(((milliseconds / 1000) % 60).toFixed(2)).replace(".",",");
		seconds = parseInt(seconds) < 10 ? "0" + seconds : seconds;
		return seconds;
	},
	invisibleResponsesCount: ()=> {
		return Session.get("allMembersCount") - Session.get("maxResponseButtons");
	},
	hasOverridenDefaultButtonCount: ()=> {
		return Session.get("responsesCountOverride");
	},
	hasTooMuchButtons: ()=> {
		return Session.get("responsesCountOverride") || (Session.get("allMembersCount") - Session.get("maxResponseButtons") > 0);
	},
	isGlobalRanking: function () {
		return Session.get("showGlobalRanking");
	},
	leaderBoardSums: function () {
		return getAllNicksWhichAreAlwaysRight();
	},
	noLeaderBoardItems: (index)=> {
		var items = getLeaderBoardItems();
		if (typeof index !== "undefined") {
			if (items[index].value.length > 0) {
				return false;
			}
		} else {
			for (var i = 0; i < items.length; i++) {
				if (items[i].value.length > 0) {
					return false;
				}
			}
		}
		return true;
	},
	leaderBoardItems: ()=> {
		return getLeaderBoardItems();
	},
	isFirstItem: function (index) {
		return index === 0;
	}
});
