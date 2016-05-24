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
import {HashtagsCollection} from '/lib/hashtags/collection.js';
import * as localData from '/lib/local_storage.js';
import {buzzsound1, setBuzzsound1} from '/client/plugins/sound/scripts/lib.js';
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
	},
	'click .sound-button': function () {
		new Splashscreen({
			autostart: true,
			templateName: "soundConfig",
			closeOnButton: "#js-btn-hideSoundModal",
			onRendered: function (instance) {
				instance.templateSelector.find('#soundSelect').on('change', function (event) {
					var hashtagDoc = HashtagsCollection.findOne({hashtag: Router.current().params.quizName});
					hashtagDoc.musicTitle = $(event.target).val();
					if (Session.get("soundIsPlaying")) {
						buzzsound1.stop();
						setBuzzsound1($(event.target).val());
						buzzsound1.play();
					} else {
						setBuzzsound1($(event.target).val());
					}
					Meteor.call('HashtagsCollection.updateMusicSettings', hashtagDoc);
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
					var hashtagDoc = HashtagsCollection.findOne({hashtag: Router.current().params.quizName});
					var btn = $('#isSoundOnButton');
					btn.toggleClass("down");
					if (btn.hasClass("down")) {
						hashtagDoc.musicEnabled = 1;
						btn.html(TAPi18n.__("plugins.sound.active"));
					} else {
						hashtagDoc.musicEnabled = 0;
						btn.html(TAPi18n.__("plugins.sound.inactive"));
					}
					Meteor.call('HashtagsCollection.updateMusicSettings', hashtagDoc);
				});
			},
			onDestroyed: function () {
				var hashtagDoc = HashtagsCollection.findOne({hashtag: Router.current().params.quizName});
				hashtagDoc.musicVolume = Session.get("slider2");
				Meteor.call('HashtagsCollection.updateMusicSettings', hashtagDoc);
			}
		});
	},
	"click .qr-code-button": function () {
		const url = window.location.protocol + "//" + window.location.host + "/" + Router.current().params.quizName;
		const qrCodeContainer = $(".qr-code-container");
		const qrCodeSize = function () {
			let width = $(window).outerWidth();
			const height = $(window).outerHeight();
			if (width > height) {
				return height * 0.8;
			}
			return width * 0.7;
		};
		const calcQrCodeContainerSize = function () {
			qrCodeContainer.find("canvas").remove();
			var img = new window.Image();
			img.addEventListener("load", function () {
				qrCodeContainer.find(".qr-code-item").qrcode({
					background: "white",
					size: qrCodeSize(),
					text: url,
					quiet: 1,
					mode: 4,
					minVersion: 6,
					mSize: 0.3,
					ecLevel: 'H',
					image: img
				});
			});
			img.setAttribute("src", "/images/icons/arsNovaClick-192.png");
			qrCodeContainer.css({
				top: $(window).outerHeight() / 2 - (qrCodeSize() + 50) / 2,
				left: $(window).outerWidth() / 2 - qrCodeSize() / 2
			});
			$('.qr-code-container-close').css("left", qrCodeSize() + 5);
			qrCodeContainer.show();
		};
		const windowResizeHandler = function () {
			calcQrCodeContainerSize();
		};
		$(window).on("resize", windowResizeHandler);
		calcQrCodeContainerSize();
		qrCodeContainer.on("click", function () {
			$(window).off("resize", windowResizeHandler);
			qrCodeContainer.hide();
		});
	}
});
