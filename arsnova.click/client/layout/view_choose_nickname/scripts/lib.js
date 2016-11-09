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
import {TAPi18n} from 'meteor/tap:i18n';
import {BannedNicksCollection} from '/lib/banned_nicks/collection.js';
import {MemberListCollection} from '/lib/member_list/collection.js';
import {SessionConfigurationCollection} from '/lib/session_configuration/collection.js';

function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length === 1 ? "0" + hex : hex;
}

export function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

export function rgbToHex(r, g, b) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function transformForegroundColor(rgbObj) {
	var o = Math.round(((parseInt(rgbObj.r) * 299) + (parseInt(rgbObj.g) * 587) + (parseInt(rgbObj.b) * 114)) / 1000);
	return o < 125 ? "#ffffff" : "#000000";
}

export function isNickAllowed(nick) {
	if (!SessionConfigurationCollection.findOne({hashtag: Router.current().params.quizName}).nicks.blockIllegal) {
		return true;
	}
	return typeof BannedNicksCollection.findOne({userNick: {$regex: new RegExp(".*" + nick.replace(/ /g, "").replace(/[0-9]/g,"") + ".*", "ig")}}) === "undefined";
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
export function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function hasTHMMail() {
	let hasTHMMail = false;
	if (!Meteor.user() || !Meteor.user().profile) {
		return false;
	}
	if (Meteor.user().profile.mail instanceof Array) {
		Meteor.user().profile.mail.forEach(function (item) {
			if (item.indexOf("thm") !== -1) {
				hasTHMMail = true;
			}
		});
	} else {
		hasTHMMail = Meteor.user().profile.mail.indexOf("thm") !== -1;
	}
	return hasTHMMail;
}

export function parseEnteredNickname(event) {
	var currentNickName = event.currentTarget.value;
	var member = MemberListCollection.findOne({nick: currentNickName});
	var $inputField = $("#nickname-input-field");

	if (currentNickName.length > 2 && currentNickName.length < 26 && !member) {
		if (isNickAllowed(currentNickName)) {
			$("#forwardButton, #loginViaCas").removeAttr("disabled");
			$inputField.popover("destroy");
		} else {
			$("#forwardButton, #loginViaCas").attr("disabled", "disabled");
			$inputField.popover("destroy");
			$inputField.popover({
				title: TAPi18n.__("view.choose_nickname.nickname_blacklist_popup"),
				trigger: 'manual',
				placement: 'bottom'
			});
			$inputField.popover("show");
		}
	} else {
		$("#forwardButton, #loginViaCas").attr("disabled", "disabled");
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
}
