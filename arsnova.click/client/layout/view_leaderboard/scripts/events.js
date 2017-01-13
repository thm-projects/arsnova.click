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
import {ResponsesCollection} from '/lib/responses/collection.js';
import {Splashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import * as localData from '/lib/local_storage.js';
import {generateExportData} from './lib.js';

Template.leaderboardFooterNavButtons.events({
	'click #showMore': ()=> {
		Session.set("responsesCountOverride", true);
	},
	'click #showLess': ()=> {
		Session.set("responsesCountOverride", false);
	},
	'click #js-btn-backToResults': ()=> {
		const goToResults = function () {
			Session.set("showGlobalRanking", false);
			Router.go("/" + Router.current().params.quizName + "/results");
		};
		if (localData.containsHashtag(Router.current().params.quizName) && !Session.get("hasDownloadedLeaderboardData") && ResponsesCollection.findOne()) {
			new Splashscreen({
				autostart: true,
				templateName: 'leaderboardDataReminderSplashscreen',
				closeOnButton: '#closeDialogButton, #returnToResults, .splashscreen-container-close>.glyphicon-remove',
				onRendered: function (template) {
					template.templateSelector.find("#returnToResults").on("click", function () {
						goToResults();
					});
				}
			});
		} else {
			goToResults();
		}
	},
	'click #downloadData': (event)=> {
		Session.set("hasDownloadedLeaderboardData", true);
		if (navigator.msSaveOrOpenBlob) {
			event.stopPropagation();
			event.preventDefault();
			const hashtag = Router.current().params.quizName;
			const time = new Date();
			const timeString = time.getDate() + "_" + (time.getMonth() + 1) + "_" + time.getFullYear();
			navigator.msSaveOrOpenBlob(new Blob([generateExportData()], {type: "text/csv"}), hashtag + "_evaluated_" + Router.current().params.id + "_" + timeString + ".csv");
		}
	}
});
