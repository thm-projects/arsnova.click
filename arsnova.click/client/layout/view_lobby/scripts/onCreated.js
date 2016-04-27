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
import {QuestionGroup} from '/lib/questions.js';
import * as localData from '/client/lib/local_storage.js';
import {splashscreenError} from '/client/plugins/splashscreen/scripts/lib.js';
import {calculateButtonCount, setMemberlistObserver} from './lib.js';

Template.memberlist.onCreated(function () {
	var oldStartTimeValues = {};

	this.subscribe('EventManager.join', Session.get("hashtag"));
	this.subscribe('MemberList.members', Session.get("hashtag"), function () {
		$(window).resize(function () {
			var finalHeight = $(window).height() - $(".navbar-fixed-top").outerHeight() - $(".navbar-fixed-bottom").outerHeight() - $(".fixed-bottom").outerHeight();
			$(".container").css("height", finalHeight + "px");
			Session.set("LearnerCountOverride", false);
			calculateButtonCount();
		});

		setMemberlistObserver({
			removed: function (id) {
				let idButton = $('#' + id);
				if (idButton.hasClass("color-changing-own-nick")) {
					splashscreenError.setErrorText(TAPi18n.__("plugins.splashscreen.error.error_messages.kicked_from_quiz"));
					splashscreenError.open();
					Router.go("/resetToHome");
				} else {
					idButton.remove();
				}
			},
			added: function () {
				calculateButtonCount();
			}
		});
	});
	this.subscribe('QuestionGroup.memberlist', Session.get("hashtag"), function () {
		var doc = QuestionGroup.findOne();
		for (var i = 0; i < doc.questionList.length; i++) {
			oldStartTimeValues[i] = doc.questionList[i].startTime;
		}
	});
	this.subscribe('Responses.session', Session.get("hashtag"), function () {
		if (Session.get("isOwner")) {
			Meteor.call('Responses.clearAll', localData.getPrivateKey(), Session.get("hashtag"));
		}
	});

	if (Session.get("isOwner")) {
		Meteor.call("EventManager.setActiveQuestion", localData.getPrivateKey(), Session.get("hashtag"), 0);
		Meteor.call("EventManager.showReadConfirmedForIndex", localData.getPrivateKey(), Session.get("hashtag"), -1);
	}
});
