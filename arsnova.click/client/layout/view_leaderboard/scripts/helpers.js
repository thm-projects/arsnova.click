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
import {getLeaderBoardItems} from './lib.js';

Template.leaderBoard.helpers({
	hashtag: ()=> {
		return Session.get("hashtag");
	},
	getNormalizedIndex: (index)=> {
		return index + 1;
	},
	isNumber: (index)=> {
		return !isNaN(index);
	},
	isOwnNick: (nick) => {
		return nick === Session.get("nick");
	},
	getTitleText: ()=> {
		if (typeof Session.get("showLeaderBoardId") !== "undefined") {
			return TAPi18n.__("view.leaderboard.title.single_question", {questionId: (Session.get("showLeaderBoardId") + 1)});
		} else {
			return TAPi18n.__("view.leaderboard.title.all_questions");
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
	showAllLeaderboard: ()=> {
		return Session.get('show_all_leaderboard');
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
	}
});
