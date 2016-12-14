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
import * as localData from '/lib/local_storage.js';
import {Splashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import * as lib from './lib.js';

Template.hashtagManagement.events({
	"click .js-reactivate-hashtag": function (event) {
		Session.set("questionGroup", localData.reenterSession($(event.currentTarget).parents(".hashtagManagementRow").attr("id")));
		lib.addHashtag(Session.get("questionGroup"));
	},
	"click .js-delete": function (event) {
		const parent = $(event.currentTarget).parents(".hashtagManagementRow");

		new Splashscreen({
			autostart: true,
			templateName: "deleteConfirmationSplashscreen",
			closeOnButton: "#closeDialogButton, #deleteSessionButton, .splashscreen-container-close",
			onRendered: function (instance) {
				instance.templateSelector.find("#session_name").text(parent.attr("id"));

				instance.templateSelector.find("#deleteSessionButton").on('click', function () {
					localData.deleteHashtag(parent.attr("id"));
					Meteor.call('Main.deleteEverything', {
						hashtag: parent.attr("id")
					});
					$(parent).prev("hr").remove();
					$(parent).remove();
				});
			}
		});
	},
	"click .startQuiz": function (event) {
		Session.set("questionGroup", localData.reenterSession($(event.currentTarget).parents(".hashtagManagementRow").attr("id")));
		if (Session.get("questionGroup").isValid()) {
			sessionStorage.setItem("overrideValidQuestionRedirect", true);
		}
		lib.addHashtag(Session.get("questionGroup"));
	}
});
