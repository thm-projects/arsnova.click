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
import {TAPi18n} from 'meteor/tap:i18n';
import {HashtagsCollection} from '/lib/hashtags/collection.js';
import * as localData from '/lib/local_storage.js';
import {buzzsound1} from '/client/plugins/sound/scripts/lib.js';
import {Splashscreen} from "/client/plugins/splashscreen/scripts/lib";
import {ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';

Template.header.helpers({
	getCurrentResetRoute: function () {
		return Router.current().params.quizName ? Router.current().params.quizName + "/resetToHome" : "";
	},
	isInHomePathOrIsStudent: function () {
		switch (Router.current().route.path()) {
			case '/':
			case '/ueber':
			case '/agb':
			case '/datenschutz':
			case '/impressum':
				return true;
		}
		return !localData.containsHashtag(Router.current().params.quizName);
	},
	isInActiveQuizAndIsStudent: function () {
		return Router.current().params.quizName && !localData.containsHashtag(Router.current().params.quizName);
	},
	isTHMStyleSelectedAndGreaterThan999Pixels: function () {
		return localStorage.getItem("theme") === "theme-thm" && $(window).width() > 999;
	},
	currentHashtag: function () {
		return Router.current().params.quizName;
	},
	isEditingQuestion: function () {
		switch (Router.current().route.getName()) {
			case ":quizName.question":
			case ":quizName.answeroptions":
			case ":quizName.settimer":
				return true;
			default:
				return false;
		}
	},
	isInLobby: function () {
		return Router.current().route.getName() === ":quizName.memberlist";
	},
	isSoundEnabled: function () {
		if (!HashtagsCollection.findOne({hashtag: Router.current().params.quizName})) {
			return;
		}
		return HashtagsCollection.findOne({hashtag: Router.current().params.quizName}).musicEnabled;
	}
});

Template.qrCodeDisplay.helpers({
	getCurrentSessionName: function () {
		return window.location.host + "/" + Router.current().params.quizName;
	}
});

Template.header.events({
	'click .kill-session-switch-wrapper, click .arsnova-logo': function () {
		if (localData.containsHashtag(Router.current().params.quizName)) {
			if (Session.get("soundIsPlaying")) {
				buzzsound1.stop();
			}

			new Splashscreen({
				autostart: true,
				templateName: "resetSessionSplashscreen",
				closeOnButton: '#closeDialogButton, #resetSessionButton',
				onRendered: function (instance) {
					instance.templateSelector.find('#resetSessionButton').on('click', function () {
						Meteor.call("Main.killAll", Router.current().params.quizName, function (err) {
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
		}
	}
});

let headerThemeTracker = null;

Template.header.onRendered(function () {
	headerThemeTracker = Tracker.autorun(function () {
		if (!Session.get("questionGroup")) {
			const hashtagDoc = HashtagsCollection.findOne({hashtag: Router.current().params.quizName});
			const theme = hashtagDoc ? hashtagDoc.theme : "theme-default";
			$('#theme-wrapper').removeClass().addClass(theme);
		}

	});
	$(window).resize(function(){
		if ($(window).width() > 999 && !$(".thm-logo-background").is(":visible")){
			$(".thm-logo-background").show();
		} else {
			$(".thm-logo-background").hide();
		}
	});
});

Template.header.onDestroyed(function () {
	if (headerThemeTracker) {
		headerThemeTracker.stop();
	}
});
