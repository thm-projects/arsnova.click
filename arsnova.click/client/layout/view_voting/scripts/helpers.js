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

import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import {TAPi18n} from 'meteor/tap:i18n';
import {Router} from 'meteor/iron:router';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import * as questionLib from '/client/layout/view_questions/scripts/lib.js';
import * as lib from './lib.js';

Template.votingview.helpers({
	getAnswerOptions: function () {
		const index = typeof Router.current().params.questionIndex === "undefined" ? EventManagerCollection.findOne().questionIndex : parseInt(Router.current().params.questionIndex);
		const result = Session.get("questionGroup").getQuestionList()[index].getAnswerOptionList().map(function (elem) {
			return elem.getAnswerText();
		});
		questionLib.parseGithubFlavoredMarkdown(result, false);
		return result;
	},
	showQuestionButton: function () {
		return isNaN(parseInt(Router.current().params.questionIndex));
	},
	showForwardButton: function () {
		return Session.get("hasToggledResponse") && !(Session.get("hasSendResponse"));
	},
	getDisplayAnswerText: function () {
		const index = typeof Router.current().params.questionIndex === "undefined" ? EventManagerCollection.findOne().questionIndex : parseInt(Router.current().params.questionIndex);
		return Session.get("questionGroup").getQuestionList()[index].getDisplayAnswerText();
	},
	isVideoAnswerText: function (questionText) {
		return !/(^!)?\[.*\]\(.*\)/.test(questionText) && /((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/.test(questionText) && (/youtube/.test(questionText) || /youtu.be/.test(questionText) || /vimeo/.test(questionText));
	},
	getVideoData: function (questionText) {
		const result = {};
		if (/youtube/.test(questionText)) {
			result.origin  = "https://www.youtube.com/embed/";
			result.videoId = questionText.substr(questionText.lastIndexOf("=") + 1, questionText.length);
		} else if (/youtu.be/.test(questionText)) {
			result.origin  = "https://www.youtube.com/embed/";
			result.videoId = questionText.substr(questionText.lastIndexOf("/") + 1, questionText.length);
		} else if (/vimeo/.test(questionText)) {
			result.origin = "https://player.vimeo.com/video/";
			result.videoId = questionText.substr(questionText.lastIndexOf("/") + 1, questionText.length);
		}
		result.videoId = result.videoId.replace(/script/g, "");
		result.embedTag = '<embed width="100%" height="200px" src="' + result.origin + result.videoId + '?html5=1&amp;rel=0&amp;hl=en_US&amp;version=3" type="text/html" allowscriptaccess="always" allowfullscreen="true" />';
		return result;
	},
	answerOptionLetter: function (number) {
		return String.fromCharCode((number + 65));
	},
	isRangedQuestion: function () {
		const index = typeof Router.current().params.questionIndex === "undefined" ? EventManagerCollection.findOne().questionIndex : parseInt(Router.current().params.questionIndex);
		return Session.get("questionGroup").getQuestionList()[index].typeName() === "RangedQuestion";
	},
	isFreeTextQuestion: function () {
		const index = typeof Router.current().params.questionIndex === "undefined" ? EventManagerCollection.findOne().questionIndex : parseInt(Router.current().params.questionIndex);
		return Session.get("questionGroup").getQuestionList()[index].typeName() === "FreeTextQuestion";
	}
});

Template.votingviewTitel.helpers({
	getCountdown: function () {
		if (this.data && this.data["data-questionIndex"]) {
			return false;
		}
		let countdownValue = (Session.get("countdownInitialized") && lib.countdown) ? lib.countdown.get() : 0;
		return TAPi18n.__("view.voting.seconds_left", {value: countdownValue, count: countdownValue});
	}
});
