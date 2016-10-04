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

import {Template} from 'meteor/templating';
import {MemberListCollection} from '/lib/member_list/collection.js';
import {calculateHeaderSize} from '/client/layout/region_header/lib.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";
import * as lib from './lib.js';

Template.nick.onRendered(function () {
	$("#forwardButton").attr("disabled", "disabled");

	if ($(window).width() >= 992) {
		$('#nickname-input-field').focus();
	}

	var hashtag = Router.current().params.quizName;
	if (MemberListCollection.findOne({hashtag: hashtag, privateKey: localStorage.getItem("privateKey")})) {
		localStorage.setItem(hashtag + "nick", MemberListCollection.findOne({hashtag: hashtag, privateKey: localStorage.getItem("privateKey")}).nick);
		Router.go("/" + hashtag + "/memberlist");
	}

	footerElements.removeFooterElements();
	footerElements.calculateFooter();
	calculateHeaderSize();
	$(window).resize(calculateHeaderSize);
});

Template.nickLimited.onRendered(function () {
	footerElements.removeFooterElements();
	footerElements.calculateFooter();
	calculateHeaderSize();
	$(window).resize(calculateHeaderSize);
});

Template.nickCasLogin.onRendered(function () {
	footerElements.removeFooterElements();
	footerElements.calculateFooter();
	calculateHeaderSize();
	$(window).resize(calculateHeaderSize);
});

