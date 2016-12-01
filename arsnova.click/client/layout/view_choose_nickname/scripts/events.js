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
import {Template} from 'meteor/templating';
import {Router} from 'meteor/iron:router';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {MemberListCollection, userNickSchema} from '/lib/member_list/collection.js';
import {NicknameCategoriesCollection} from '/lib/nickname_categories/collection.js';
import {SessionConfigurationCollection} from '/lib/session_configuration/collection.js';
import {ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import * as localData from '/lib/local_storage.js';
import * as lib from './lib.js';

Template.nickStandardFooter.events({
	"click #forwardButton": function (event) {
		event.stopPropagation();
		var nickname = $("#nickname-input-field").val();
		try {
			new SimpleSchema({
				userNick: userNickSchema
			}).validate({userNick: nickname});
			var bgColor = lib.rgbToHex(lib.getRandomInt(0, 255), lib.getRandomInt(0, 255), lib.getRandomInt(0, 255));
			Meteor.call('MemberListCollection.addLearner', {
				hashtag: Router.current().params.quizName,
				nick: nickname,
				privateKey: localData.getPrivateKey(),
				backgroundColor: bgColor,
				foregroundColor: lib.transformForegroundColor(lib.hexToRgb(bgColor))
			}, (err) => {
				if (err) {
					$("#forwardButton").attr("disabled", "disabled");
					new ErrorSplashscreen({
						autostart: true,
						errorMessage: "plugins.splashscreen.error.error_messages." + err.reason
					});
				} else {
					localStorage.setItem(Router.current().params.quizName + "nick", nickname);
					Router.go("/" + Router.current().params.quizName + "/memberlist");
				}
			});
		} catch (ex) {
			new ErrorSplashscreen({
				autostart: true,
				errorMessage: "plugins.splashscreen.error.error_messages.invalid_input_data"
			});
		}
	},
	"click #loginViaCas": function () {
		Meteor.loginWithCas(function () {
			if (!lib.hasTHMMail()) {
				return;
			}

			const hashtag  = Router.current().params.quizName;
			const nickname = $("#nickname-input-field").val();
			const bgColor  = lib.rgbToHex(lib.getRandomInt(0, 255), lib.getRandomInt(0, 255), lib.getRandomInt(0, 255));
			Meteor.call('MemberListCollection.addLearner', {
				hashtag: hashtag,
				nick: nickname,
				userRef: Meteor.user()._id,
				privateKey: localData.getPrivateKey(),
				backgroundColor: bgColor,
				foregroundColor: lib.transformForegroundColor(lib.hexToRgb(bgColor))
			}, function (err) {
				if (err) {
					$("#forwardButton").attr("disabled", "disabled");
					new ErrorSplashscreen({
						autostart: true,
						errorMessage: "plugins.splashscreen.error.error_messages." + err.reason
					});
				} else {
					localStorage.setItem(hashtag + "nick", nickname);
					Router.go("/" + hashtag + "/memberlist");
				}
			});
		});
	},
	"click #backButton": function () {
		Router.go("/" + Router.current().params.quizName + "/resetToHome");
	}
});

Template.nick.events({
	'input #nickname-input-field': function (event) {
		lib.parseEnteredNickname(event);
	},
	"keydown #nickname-input-field": function (event) {
		if (event.keyCode === 13) {
			var currentNickName = event.currentTarget.value;
			var member = MemberListCollection.findOne({nick: currentNickName});

			if (currentNickName.length > 2 && !member) {
				$("#forwardButton, #loginViaCas").click();
			}
		}
	}
});

Template.nickLimitedFooter.events({
	"click #backButton": function () {
		Router.go("/" + Router.current().params.quizName + "/resetToHome");
	}
});
Template.nickLimited.events({
	"click .selectableNick": function (event) {
		const configDoc = SessionConfigurationCollection.findOne({hashtag: Router.current().params.quizName});
		const login = function (userRef = undefined) {
			const nickname = NicknameCategoriesCollection.findOne({_id: $(event.currentTarget).attr("id").replace("selectableNick_", "")}).nick;
			const bgColor = lib.rgbToHex(lib.getRandomInt(0, 255), lib.getRandomInt(0, 255), lib.getRandomInt(0, 255));
			Meteor.call('MemberListCollection.addLearner', {
				hashtag: Router.current().params.quizName,
				nick: nickname,
				userRef: userRef,
				privateKey: localData.getPrivateKey(),
				backgroundColor: bgColor,
				foregroundColor: lib.transformForegroundColor(lib.hexToRgb(bgColor))
			}, (err) => {
				if (err) {
					new ErrorSplashscreen({
						autostart: true,
						errorMessage: "plugins.splashscreen.error.error_messages." + err.reason
					});
				} else {
					localStorage.setItem(Router.current().params.quizName + "nick", nickname);
					Router.go("/" + Router.current().params.quizName + "/memberlist");
				}
			});
		};
		if (!configDoc) {
			return null;
		}
		if (configDoc.nicks.restrictToCASLogin) {
			Meteor.loginWithCas(function () {
				if (!lib.hasTHMMail()) {
					return;
				}
				login(Meteor.user()._id);
			});
		} else {
			login();
		}
	}
});
