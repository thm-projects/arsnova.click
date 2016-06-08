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
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {TAPi18n} from 'meteor/tap:i18n';
import {MemberListCollection, userNickSchema} from '/lib/member_list/collection.js';
import {ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import * as localData from '/lib/local_storage.js';
import * as lib from './lib.js';

Template.nick.events({
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
	"click #backButton": function () {
		Router.go("/" + Router.current().params.quizName + "/resetToHome");
	},
	'input #nickname-input-field': function (event) {
		var currentNickName = event.currentTarget.value;
		var member = MemberListCollection.findOne({nick: currentNickName});
		var $inputField = $("#nickname-input-field");

		if (currentNickName.length > 2 && currentNickName.length < 26 && !member) {
			if (lib.isNickAllowed(currentNickName)) {
				$("#forwardButton").removeAttr("disabled");
				$inputField.popover("destroy");
			} else {
				$("#forwardButton").attr("disabled", "disabled");
				$inputField.popover("destroy");
				$inputField.popover({
					title: TAPi18n.__("view.choose_nickname.nickname_blacklist_popup"),
					trigger: 'manual',
					placement: 'bottom'
				});
				$inputField.popover("show");
			}
		} else {
			$("#forwardButton").attr("disabled", "disabled");
			if (currentNickName.length === 0 || !member) {
				$inputField.popover("destroy");
			}
			if (currentNickName.length < 3) {
				$inputField.popover({
					title: TAPi18n.__("view.choose_nickname.nickname_too_short"),
					trigger: 'manual',
					placement: 'bottom'
				});
				$inputField.popover("show");
			} else {
				if (currentNickName.length > 25) {
					$inputField.popover({
						title: TAPi18n.__("view.choose_nickname.nickname_too_long"),
						trigger: 'manual',
						placement: 'bottom'
					});
					$inputField.popover("show");
				} else {
					$inputField.popover({
						title: TAPi18n.__("view.choose_nickname.nickname_na_popup"),
						trigger: 'manual',
						placement: 'bottom'
					});
					$inputField.popover("show");
				}
			}
		}
	},
	"keydown #nickname-input-field": function (event) {
		if (event.keyCode == 13) {
			var currentNickName = event.currentTarget.value;
			var member = MemberListCollection.findOne({nick: currentNickName});

			if (currentNickName.length > 2 && !member) {
				$("#forwardButton").click();
			}
		}
	}
});
