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
import {TAPi18n} from 'meteor/tap:i18n';
import {SessionConfigurationCollection} from '/lib/session_configuration/collection.js';
import * as localData from '/lib/local_storage.js';
import {countdownRunningSound} from '/client/plugins/sound/scripts/lib.js';
import {Splashscreen} from "/client/plugins/splashscreen/scripts/lib.js";
import * as lib from './lib.js';

Template.header.helpers({
	getCurrentResetRoute: function () {
		return Router.current().params.quizName ? Router.current().params.quizName + "/resetToHome" : "";
	},
	isInHomePath: function () {
		return Router.current().route.path() === '/' || Router.current().route.getName() === "preview.:themeName.:language";
	},
	getCurrentTitle: function () {
		switch (Router.current().route.path()) {
			case "/about":
				return TAPi18n.__("region.footer.about.title");
			case "/imprint":
				return TAPi18n.__("region.footer.imprint.title");
			case "/dataprivacy":
				return TAPi18n.__("region.footer.data_privacy.title");
			case "/agb":
				return TAPi18n.__("region.footer.tos.title");
			case "/theme":
				return TAPi18n.__("view.theme_switcher.set_theme");
			case "/translate":
				return TAPi18n.__("view.translation.translations");
			case "/hashtagmanagement":
				return TAPi18n.__("view.hashtag_management.session_management");
			default:
				let currentPath = Router.current().route.getName().replace(/(:quizName.)*(.:id)*(.:questionIndex)*/g, "");
				switch (currentPath) {
					case "quizManager":
						return TAPi18n.__("view.quiz_manager.title");
					case "questionType":
						return TAPi18n.__("view.question_type.title");
					case "question":
						return TAPi18n.__("view.questions.title");
					case "answeroptions":
						return TAPi18n.__("view.answeroptions.title");
					case "nicknameCategories":
						return TAPi18n.__("view.nickname_categories.title");
					case "settimer":
						return TAPi18n.__("view.timer.title");
					case "quizSummary":
						return TAPi18n.__("view.quiz_summary.title");
					case "memberlist":
						return Router.current().params.quizName;
					case "results":
						let returnResult = TAPi18n.__("view.liveResults.title");
						if (Session.get("countdownInitialized")) {
							returnResult = TAPi18n.__("view.liveResults.title_running_countdown");
						} else if (Session.get("showingReadingConfirmation")) {
							returnResult = TAPi18n.__("view.liveResults.title_reading_confirmation");
						}
						return returnResult;
					case "onpolling":
						return TAPi18n.__("view.voting.title");
					case "leaderBoard":
						return Router.current().params.id === "all" ? TAPi18n.__("view.leaderboard.global_header") : TAPi18n.__("view.leaderboard.header");
					case "nick":
						return TAPi18n.__("view.choose_nickname.enter_nickname");
					default:
						return "arsnova.click";
				}
		}
	},
	isEditingQuestion: lib.isEditingQuestion,
	isInLobby: function () {
		return Router.current().route.getName() === ":quizName.memberlist";
	},
	isSoundEnabled: function () {
		const configDoc = SessionConfigurationCollection.findOne({hashtag: Router.current().params.quizName});
		if (configDoc) {
			return configDoc.music.isEnabled;
		}
	}
});

Template.qrCodeDisplay.helpers({
	getCurrentSessionName: function () {
		if (!Router.current().params.quizName) {
			return;
		}
		return window.location.host + "/" + Router.current().params.quizName.replace(/ /g,"+");
	}
});

Template.arsnovaClickLogo.helpers({
	getOrigin: function () {
		return /^localhost/.test(window.location.host) ? "alpha" : /^staging/.test(window.location.host) ? "staging" : "";
	}
});

Template.header.events({
	'click .arsnova-logo': function () {
		if (!Router.current().params.quizName) {
			Router.go("/");
			return;
		}
		if (localData.containsHashtag(Router.current().params.quizName)) {
			if (Session.get("soundIsPlaying")) {
				countdownRunningSound.stop();
			}

			new Splashscreen({
				autostart: true,
				templateName: "resetSessionSplashscreen",
				closeOnButton: '#closeDialogButton, #resetSessionButton, .splashscreen-container-close',
				onRendered: function (instance) {
					instance.templateSelector.find('#resetSessionButton').on('click', function () {
						Meteor.call("Main.killAll", Router.current().params.quizName);
						Router.go("/" + Router.current().params.quizName + "/resetToHome");
					});
				}
			});
		} else {
			new Splashscreen({
				autostart: true,
				templateName: "exitSessionSplashscreen",
				closeOnButton: '#closeDialogButton, #exitSessionButton, .splashscreen-container-close',
				onRendered: function (instance) {
					instance.templateSelector.find('#exitSessionButton').on('click', function () {
						Router.go("/" + Router.current().params.quizName + "/resetToHome");
					});
				}
			});
		}
	}
});

Template.header.onRendered(function () {
	const self = this;

	if (!Session.get("questionGroup") && Router.current().params.quizName && localData.containsHashtag(Router.current().params.quizName)) {
		Session.set("questionGroup", localData.reenterSession(Router.current().params.quizName));
	}

	$(window).on('resize', lib.headerTrackerCallback);

	$(function () {
		setTimeout(function () {
			self.autorun(function () {
				lib.headerTrackerCallback();
			}.bind(this));
			self.autorun(function () {
				let title = "arsnova.click";
				if (/^localhost/.test(window.location.host)) {
					title += " (local)";
				} else if (/^staging/.test(window.location.host)) {
					title += " (staging)";
				}
				$('title').text(title);
			}.bind(this));
		}, 100);
	});
});
