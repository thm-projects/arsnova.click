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
import {TAPi18n} from 'meteor/tap:i18n';
import {MemberListCollection} from '/lib/member_list/collection.js';
import * as localData from '/client/lib/local_storage.js';
import {Splashscreen, ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import {calculateButtonCount} from './lib.js';

Template.memberlist.events({
	"click .btn-more-learners": function () {
		Session.set("learnerCount", MemberListCollection.find().count());
		Session.set("learnerCountOverride", true);
	},
	'click .btn-less-learners': function () {
		Session.set("learnerCountOverride", false);
		calculateButtonCount();
	},
	'click .btn-learner': function (event) {
		event.preventDefault();
		if (!localData.containsHashtag(Router.current().params.quizName)) {
			return;
		}
		new Splashscreen({
			autostart: true,
			templateName: "kickMemberSplashscreen",
			closeOnButton: '#closeDialogButton, #kickMemberButton',
			onRendered: function (instance) {
				instance.templateSelector.find('#nickName').text($(event.currentTarget).text().replace(/(?:\r\n|\r| |\n)/g, ''));
				instance.templateSelector.find('#kickMemberButton').on('click', function () {
					Meteor.call('MemberListCollection.removeLearner', localData.getPrivateKey(), Router.current().params.quizName, $(event.currentTarget).attr("id"), function (err) {
						if (err) {
							new ErrorSplashscreen({
								autostart: true,
								errorMessage: TAPi18n.__("plugins.splashscreen.error.error_messages." + err.reason)
							});
						}
					});
				});
			}
		});
	},
	'click #startPolling': function () {
		$('.sound-button').hide();
		localStorage.setItem(Router.current().params.quizName + "sessionClosed", false);
		Meteor.call("EventManagerCollection.setActiveQuestion", localData.getPrivateKey(), Router.current().params.quizName, -1);
		Meteor.call('EventManagerCollection.setSessionStatus', localData.getPrivateKey(), Router.current().params.quizName, 3);
	}
});
