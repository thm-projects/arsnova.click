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
import * as localData from '/lib/local_storage.js';
import {generateExportData} from './lib.js';

Template.leaderboardTitle.helpers({
	getTitleText: ()=> {
		return Router.current().params.id === "all" ? TAPi18n.__("view.leaderboard.title.all_questions") : TAPi18n.__("view.leaderboard.title.single_question", {questionId: (parseInt(Router.current().params.id) + 1)});
	}
});

Template.leaderboardFooterNavButtons.helpers({
	getButtonCols: ()=> {
		if (!Session.get("nicks")) {
			return 12;
		}
		const hasTooMuchButtons = Session.get("responsesCountOverride") || (Session.get("allMembersCount") - (Session.get("maxResponseButtons") + 1) > 0);
		if (Session.get("nicks").length === 0) {
			return 12;
		} else if (localData.containsHashtag(Router.current().params.quizName)) {
			if (hasTooMuchButtons) {
				return 4;
			} else {
				return 6;
			}
		} else {
			if (hasTooMuchButtons) {
				return 6;
			} else {
				return 12;
			}
		}
	},
	noLeaderBoardItems: ()=> {
		if (!Session.get("nicks")) {
			return true;
		}
		return Session.get("nicks").length === 0;
	},
	hasTooMuchButtons: ()=> {
		return Session.get("responsesCountOverride") || (Session.get("allMembersCount") - (Session.get("maxResponseButtons") + 1) > 0);
	},
	hasOverridenDefaultButtonCount: ()=> {
		return Session.get("responsesCountOverride");
	},
	invisibleResponsesCount: ()=> {
		return Session.get("allMembersCount") - (Session.get("maxResponseButtons") + 1);
	},
	isOwner: function () {
		return localData.containsHashtag(Router.current().params.quizName);
	},
	exportData: function () {
		const hashtag = Router.current().params.quizName;
		const time = new Date();
		const timeString = time.getDate() + "_" + (time.getMonth() + 1) + "_" + time.getFullYear();
		return {
			href: 'data:text/csv;charset=utf-8,' + encodeURIComponent(generateExportData()),
			name: hashtag + "_evaluated_" + Router.current().params.id + "_" + timeString + ".csv"
		};
	}
});

Template.leaderBoard.helpers({
	getNormalizedIndex: (index)=> {
		return index + 1;
	},
	isNumber: (index)=> {
		return !isNaN(index);
	},
	isOwnNick: (nick) => {
		return nick === localStorage.getItem(Router.current().params.quizName + "nick");
	},
	parseTimeToSeconds: function (milliseconds) {
		let seconds = (milliseconds / 1000).toFixed(2);
		return String((seconds < 10 ? "0" + seconds : seconds)).replace(".",",");
	},
	invisibleResponsesCount: ()=> {
		return Session.get("allMembersCount") - (Session.get("maxResponseButtons") + 1);
	},
	hasOverridenDefaultButtonCount: ()=> {
		return Session.get("responsesCountOverride");
	},
	hasTooMuchButtons: ()=> {
		return Session.get("responsesCountOverride") || (Session.get("allMembersCount") - (Session.get("maxResponseButtons") + 1) > 0);
	},
	isGlobalRanking: function () {
		return Router.current().params.id === "all";
	},
	leaderBoardSums: function () {
		return Session.get("nicks");
	},
	noLeaderBoardItems: ()=> {
		if (!Session.get("nicks")) {
			return true;
		}
		return Session.get("nicks").length === 0;
	},
	leaderBoardItems: ()=> {
		if (!Session.get("nicks")) {
			return false;
		}
		if (Session.get("responsesCountOverride")) {
			return Session.get("nicks");
		} else {
			return Session.get("nicks").slice(0, Session.get("maxResponseButtons") + 1);
		}
	},
	isFirstItem: function (index) {
		return index === 0;
	},
	isOwner: function () {
		return localData.containsHashtag(Router.current().params.quizName);
	},
	exportData: function () {
		const hashtag = Router.current().params.quizName;
		const time = new Date();
		const timeString = time.getDate() + "_" + (time.getMonth() + 1) + "_" + time.getFullYear();
		return {
			href: 'data:text/csv;charset=utf-8,' + encodeURIComponent(generateExportData()),
			name: hashtag + "_evaluated_" + Router.current().params.id + "_" + timeString + ".csv"
		};
	}
});
