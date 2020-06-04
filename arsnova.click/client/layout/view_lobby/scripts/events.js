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
import {Router} from 'meteor/iron:router';
import * as localData from '/lib/local_storage.js';
import {Splashscreen} from '/client/plugins/splashscreen/scripts/lib.js';

Template.memberlist.events({
	'click .btn-learner': function (event) {
		event.preventDefault();
		if (!localData.containsHashtag(Router.current().params.quizName)) {
			return;
		}
		new Splashscreen({
			autostart: true,
			templateName: "kickMemberSplashscreen",
			closeOnButton: '#closeDialogButton, #kickMemberButton, .splashscreen-container-close>.glyphicon-remove',
			onRendered: function (instance) {
				instance.templateSelector.find('#nickName').text($(event.currentTarget).text().replace(/(?:\r\n|\r| |\n)/g, ''));
				instance.templateSelector.find('#kickMemberButton').on('click', function () {
					Meteor.call('MemberListCollection.removeLearner', Router.current().params.quizName, $(event.currentTarget).attr("id"));
					if (instance.templateSelector.find("#ban-nick").prop("checked")) {
						Meteor.call('BannedNicksCollection.insert', instance.templateSelector.find('#nickName').text());
					}
				});
			}
		});
	}
});

Template.kickMemberSplashscreen.events({
	"click #ban-nick-label": function () {
		const banNickInput = $('#ban-nick');
		banNickInput.prop("checked", !banNickInput.prop("checked"));
	}
});

Template.memberlistFooterNavButtons.events({
	'click #showMore': () => {
		Session.set("learnerCountOverride", true);
	},
	'click #showLess': () => {
		Session.set("learnerCountOverride", false);
	},
	'click #startPolling': function () {
		Session.set("sessionClosed", false);
		const index = Session.get("questionGroup").getConfiguration().getReadingConfirmationEnabled() ? -1 : 0;
		Meteor.call('EventManagerCollection.startQuiz', Router.current().params.quizName, index);
	}
});
