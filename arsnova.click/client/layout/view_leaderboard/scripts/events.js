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
import {generateExportData} from './lib.js';

Template.leaderboardFooterNavButtons.events({
	'click #showMore': ()=> {
		Session.set("responsesCountOverride", true);
	},
	'click #showLess': ()=> {
		Session.set("responsesCountOverride", false);
	},
	'click #js-btn-backToResults': ()=> {
		Session.set("showGlobalRanking", false);
		Router.go("/" + Router.current().params.quizName + "/results");
	},
	'click #downloadData': ()=> {
		if (navigator.msSaveOrOpenBlob) {
			const hashtag = Router.current().params.quizName;
			const time = new Date();
			const timeString = time.getDate() + "_" + (time.getMonth() + 1) + "_" + time.getFullYear();
			navigator.msSaveOrOpenBlob(new Blob([generateExportData()], {type: "text/csv"}), hashtag + "_evaluated_" + Router.current().params.id + "_" + timeString + ".csv");
		}
	}
});
