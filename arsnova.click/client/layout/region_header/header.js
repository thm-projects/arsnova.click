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
import * as localData from '/client/lib/local_storage.js';
import {buzzsound1, setBuzzsound1} from '/client/plugins/sound/scripts/lib.js';
import {Splashscreen} from "/client/plugins/splashscreen/scripts/lib";
import {ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';

Template.header.onCreated(function () {
	Session.setDefault("slider2", 80);
	Session.setDefault("globalVolume", 80);

	setBuzzsound1('waity.mp3');
});

Template.header.helpers({
	getCurrentRoute: function () {
		return "/" + Router.current().params.quizName;
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
	}
});

Template.header.events({
	'click .kill-session-switch-wrapper, click .arsnova-logo': function () {
		if (localData.containsHashtag(Router.current().params.quizName)) {
			buzzsound1.stop();

			new Splashscreen({
				autostart: true,
				templateName: "resetSessionSplashscreen",
				closeOnButton: '#closeDialogButton, #resetSessionButton',
				onRendered: function (instance) {
					instance.templateSelector.find('#resetSessionButton').on('click', function () {
						Meteor.call("Main.killAll", localData.getPrivateKey(), Router.current().params.quizName, function (err) {
							if (err) {
								new ErrorSplashscreen({
									autostart: true,
									errorMessage: TAPi18n.__("plugins.splashscreen.error.error_messages." + err.reason)
								});
							}
						});
						Router.go("/" + Router.current().params.quizName + "/resetToHome");
					});
				}
			});
		} else {
			Router.go("/" + Router.current().params.quizName + "/resetToHome");
		}
	},
	'click .sound-button': function () {
		new Splashscreen({
			autostart: true,
			templateName: "soundConfig",
			closeOnButton: "#js-btn-hideSoundModal",
			onRendered: function (instance) {
				instance.templateSelector.find('#soundSelect').on('change', function (event) {
					buzzsound1.stop();
					Session.set("soundIsPlaying", false);
					switch ($(event.target).val()) {
						case "Song1":
							setBuzzsound1("bensound-thelounge.mp3");
							break;
						case "Song2":
							setBuzzsound1("bensound-cute.mp3");
							break;
						case "Song3":
							setBuzzsound1("bensound-epic.mp3");
							break;
					}
				});

				instance.templateSelector.find("#js-btn-playStopMusic").on('click', function () {
					if (Session.get("soundIsPlaying")) {
						buzzsound1.stop();
						Session.set("soundIsPlaying", false);
					} else {
						buzzsound1.play();
						Session.set("soundIsPlaying", true);
					}
				});

				instance.templateSelector.find("#js-btn-hideSoundModal").on('click', function () {
					buzzsound1.stop();
					Session.set("soundIsPlaying", false);
				});

				instance.templateSelector.find('#isSoundOnButton').on('click', function () {
					var btn = $('#isSoundOnButton');
					btn.toggleClass("down");
					if (btn.hasClass("down")) {
						Session.set("togglemusic", true);
						btn.html(TAPi18n.__("plugins.sound.active"));
					} else {
						Session.set("togglemusic", false);
						btn.html(TAPi18n.__("plugins.sound.inactive"));
					}
				});
			}
		});
	}
});
