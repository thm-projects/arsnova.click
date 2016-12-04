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
import {Router} from 'meteor/iron:router';
import {TAPi18n} from 'meteor/tap:i18n';
import {MemberListCollection} from '/lib/member_list/collection.js';
import {SessionConfigurationCollection} from '/lib/session_configuration/collection.js';
import * as localData from '/lib/local_storage.js';
import {calculateTitelHeight} from '/client/layout/region_header/lib.js';
import {calculateFooterFontSize} from '/client/layout/region_footer/scripts/lib.js';
import * as nicknameLib from '/client/layout/view_choose_nickname/scripts/lib.js';
import {cleanUp} from "./routes.js";
import {Splashscreen} from "/client/plugins/splashscreen/scripts/lib.js";
import {randomIntFromInterval} from '/client/layout/view_live_results/scripts/lib.js';

export function getUserLanguage() {
	/* Get the language of the browser */
	let userLang = navigator.language || navigator.userLanguage;
	/* Provide a fallback language */
	let selectedLang = "en";
	// If private mode is enabled, the access to the local storage will fail.
	try {
		/* Get the language setting from the local storage */
		let localStorageLang = localData.getLanguage();
		/* Override the default language with the browser language if available */
		if (TAPi18n.languages_names[userLang]) {
			selectedLang = userLang;
		}
		/* Override the browser language with the set language of the local storage if available */
		if (TAPi18n.languages_names[localStorageLang.data]) {
			selectedLang = localStorageLang.data;
		}
		localData.initializePrivateKey();
		localStorage.setItem("localStorageAvailable", true);
	} catch (err) {
		// Private mode enabled. Error splashscreen is shown in route.js
	}
	if (Router.current() && Router.current().params.language) {
		selectedLang = Router.current().params.language;
	}
	return selectedLang;
}

export function createTabIndices() {
	Meteor.defer(function () {
		let index = 1;
		$('.tabbable').each(function (itemIndex, item) {
			$(item).attr("tabindex", index++);
		});
	});
}

Meteor.startup(function () {
	if (Meteor.isClient) {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/serviceWorker.js').then().catch(error => console.log(error));
		}
		$.getScript('/lib/highlight.pack.min.js');
		$.getScript('/lib/marked.min.js');
		TAPi18n.setLanguage(getUserLanguage()).then(function () {
			window.cookieconsent_options = {
				"message": TAPi18n.__("global.cookie_consent.message"),
				"dismiss": TAPi18n.__("global.cookie_consent.dismiss"),
				"learnMore": TAPi18n.__("global.cookie_consent.learn_more"),
				"link": "dataprivacy",
				"theme": "dark-floating"
			};
			$.getScript("//cdnjs.cloudflare.com/ajax/libs/cookieconsent2/1.0.10/cookieconsent.min.js");
		});
		navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
		$(function() {
			FastClick.attach(document.body);
		});
		document.onkeyup = function (event) {
			if (event.keyCode === 9) {
				$(".focused").removeClass("focused");
				if ($(document.activeElement).prop("tagName") !== "BODY") {
					$(document.activeElement).addClass("focused");
				}
				$('.removeQuestion').css("height", "initial");
				if ($(document.activeElement).hasClass("questionIcon")) {
					$(document.activeElement).find(".removeQuestion").css("height", "44px");
				}
				$('.smallGlyphicon').removeClass("smallGlyphicon");
				if ($(document.activeElement).hasClass("button-markdown")) {
					$(document.activeElement).find(".glyphicon").addClass("smallGlyphicon");
				}
				calculateTitelHeight();
				calculateFooterFontSize();
			}
		};
		$(document).on("keyup", ".focused", function () {
			if (event.keyCode === 13) {
				$(".focused").click();
			}
		});
		document.onmousedown = function () {
			$(".focused").removeClass("focused");
			$('.removeQuestion').css("height", "initial");
			$('.smallGlyphicon').removeClass("smallGlyphicon");
			calculateTitelHeight();
		};
		if (location.origin.indexOf("staging.arsnova.click") > -1 || location.origin.indexOf("localhost") > -1) {
			// Enable Debug object
			Debug = {
				addMembers: function (amount) {
					if (amount > 50) {
						throw new Error("Only 50 Members may be added per command call");
					}
					const hashtag  = Router.current().params.quizName;
					if (!Session.get("questionGroup") || !localData.containsHashtag(hashtag)) {
						throw new Error("Unsupported Operation: Invalid credentials");
					}
					const debugMemberCount = MemberListCollection.find({hashtag: hashtag, nick: {$regex: "debug_user_*", $options: "i"}}).count();
					const selectedNicks = SessionConfigurationCollection.findOne().nicks.selectedValues;
					for (let i = 1; i < amount + 1; i++) {
						if (MemberListCollection.find().fetch().length === selectedNicks.length) {
							return;
						}
						let nickname = "";
						if (selectedNicks.length > 0) {
							do {
								nickname = selectedNicks[randomIntFromInterval(0, selectedNicks.length - 1)];
							} while (MemberListCollection.findOne({nick: nickname}));
						} else {
							nickname = "debug_user_" + (i + debugMemberCount);
						}
						const bgColor  = nicknameLib.rgbToHex(nicknameLib.getRandomInt(0, 255), nicknameLib.getRandomInt(0, 255), nicknameLib.getRandomInt(0, 255));
						Meteor.call('MemberListCollection.addLearner', {
							hashtag: hashtag,
							nick: nickname,
							isDummyUser: true,
							privateKey: localData.getPrivateKey(),
							backgroundColor: bgColor,
							foregroundColor: nicknameLib.transformForegroundColor(nicknameLib.hexToRgb(bgColor))
						});
					}
				},
				removeMembers: function () {
					if (!Session.get("questionGroup") || !localData.containsHashtag(Session.get("questionGroup").getHashtag())) {
						throw new Error("Unsupported Operation: Invalid credentials");
					}
					Meteor.call("MemberListCollection.removeDebugUsersFromSession", Router.current().params.quizName);
				}
			};
		}
		/* Triggers the session cleanup if the user closes the tab or the browser
		 * @see http://stackoverflow.com/a/26275621
		 */
		const confirmLeave = function () {
			if (typeof Router.current().params.quizName !== "undefined" && !localData.containsHashtag(Router.current().params.quizName)) {
				new Splashscreen({
					autostart: true,
					templateName: "exitSessionSplashscreen",
					closeOnButton: '#closeDialogButton, #exitSessionButton, .splashscreen-container-close',
					onRendered: function (instance) {
						instance.templateSelector.find('#exitSessionButton').on('click', function () {
							cleanUp();
						});
					}
				});
				return "";
			}
			return null;
		};
		$(window).on('mouseover', (function () {
			window.onbeforeunload = null;
		}));
		$(window).on('mouseout', (function () {
			window.onbeforeunload = confirmLeave;
		}));
		var prevKey = "";
		$(document).keydown(function (e) {
			if (e.key.toUpperCase() == "W" && prevKey == "CONTROL") {
				window.onbeforeunload = confirmLeave;
			} else if (e.key.toUpperCase() == "F4" && (prevKey == "ALT" || prevKey == "CONTROL")) {
				window.onbeforeunload = confirmLeave;
			}
			prevKey = e.key.toUpperCase();
		});
	}
});
