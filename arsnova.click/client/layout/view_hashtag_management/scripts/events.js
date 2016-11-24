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
import {Template} from 'meteor/templating';
import {Tracker} from 'meteor/tracker';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import * as localData from '/lib/local_storage.js';
import {Splashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import * as lib from './lib.js';

Template.hashtagManagement.events({
	"click .js-reactivate-hashtag": function (event) {
		var hashtag = $(event.currentTarget).parent().parent()[0].id;
		Session.set("questionGroup", localData.reenterSession(hashtag));
		lib.addHashtag(Session.get("questionGroup"));
	},
	"click .js-delete": function (event) {
		const hashtagRow = $(event.currentTarget).parent().parent();

		new Splashscreen({
			autostart: true,
			templateName: "deleteConfirmationSplashscreen",
			closeOnButton: "#closeDialogButton, #deleteSessionButton, .splashscreen-container-close",
			onRendered: function (instance) {
				instance.templateSelector.find("#session_name").text(hashtagRow[0].id);

				instance.templateSelector.find("#deleteSessionButton").on('click', function () {
					localData.deleteHashtag(hashtagRow[0].id);
					Meteor.call('Main.deleteEverything', {
						hashtag: hashtagRow[0].id
					});
					hashtagRow.prev("hr").remove();
					hashtagRow.remove();
				});
			}
		});
	},
	"click .startQuiz": function (event) {
		var hashtag = $(event.currentTarget).parents(".hashtagManagementRow").attr("id");
		Session.set("questionGroup", localData.reenterSession(hashtag));
		if (Session.get("questionGroup").isValid()) {
			sessionStorage.setItem("overrideValidQuestionRedirect", true);
		}
		lib.addHashtag(Session.get("questionGroup"));
	}
});
