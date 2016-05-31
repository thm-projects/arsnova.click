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
import * as localData from '/lib/local_storage.js';

export function addNewQuestion(callback) {
	const questionItem = Session.get("questionGroup");
	const index = questionItem.getQuestionList().length;
	questionItem.addDefaultQuestion();
	Session.set("questionGroup", questionItem);
	localData.addHashtag(questionItem);
	Meteor.call("EventManagerCollection.setActiveQuestion", Router.current().params.quizName, index, function () {
		Router.go("/" + Router.current().params.quizName + "/question");
		if (callback) {
			callback();
		}
	});
}

export function calculateTitelHeight() {
	var fixedTop = $(".navbar-fixed-top");
	var container = $(".container");
	var footerHeight = $(".fixed-bottom").outerHeight() + $(".footer-info-bar").outerHeight();
	var finalHeight = $(window).height() - fixedTop.outerHeight() - $(".navbar-fixed-bottom").outerHeight() - footerHeight;

	container.css("height", finalHeight);
	container.css("margin-top", fixedTop.outerHeight());

	return {
		height: finalHeight,
		marginTop: fixedTop.outerHeight()
	};
}

export function calculateHeaderSize() {
	var hashtagLength = Router.current().params.quizName.length;
	var fontSize = "";
	let logoHeight = 0;

	if ($(document).width() > $(document).height()) {
		logoHeight = "8vw";
	} else {
		logoHeight = "8vh";
	}
	$('.arsnova-logo img').css("height", logoHeight);

	if (hashtagLength <= 15) {
		if ($(document).width() > $(document).height()) {
			if ($(document).width() < 1200) {
				fontSize = "6vw";
			} else {
				fontSize = "5vw";
			}
		} else {
			fontSize = "5vh";
		}
	} else if (hashtagLength <= 20) {
		if ($(document).width() > $(document).height()) {
			fontSize = "5.5vw";
		} else {
			fontSize = "4vh";
		}
	} else {
		if ($(document).width() > $(document).height()) {
			fontSize = "5vw";
		} else {
			fontSize = "3vh";
		}
	}
	$(".header-titel").css({"font-size": fontSize, "line-height": $('.arsnova-logo').height() + "px"});
}
