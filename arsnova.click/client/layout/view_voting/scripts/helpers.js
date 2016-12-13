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
import * as lib from './lib.js';

Template.votingview.helpers({
	answerOptions: function () {
		const index = parseInt(Router.current().params.questionIndex) || EventManagerCollection.findOne().questionIndex;
		return Session.get("questionGroup").getQuestionList()[index].getAnswerOptionList();
	},
	showQuestionButton: function () {
		return !(this.data && this.data["data-questionIndex"]);
	},
	showForwardButton: function () {
		return Session.get("hasToggledResponse") && !(Session.get("hasSendResponse"));
	},
	getDisplayAnswerText: function () {
		const index = parseInt(Router.current().params.questionIndex) || EventManagerCollection.findOne().questionIndex;
		return Session.get("questionGroup").getQuestionList()[index].getDisplayAnswerText();
	},
	isVideoAnswerText: function (number) {
		const index = parseInt(Router.current().params.questionIndex) || EventManagerCollection.findOne().questionIndex;
		const answer = Session.get("questionGroup").getQuestionList()[index].getAnswerOptionList()[number];
		if (!answer) {
			return;
		}
		const answerText = answer.getAnswerText();
		return /youtube/.test(answerText) || /youtu.be/.test(answerText) || /vimeo/.test(answerText);
	},
	getVideoData: function (number) {
		const index = parseInt(Router.current().params.questionIndex) || EventManagerCollection.findOne().questionIndex;
		const answerText = Session.get("questionGroup").getQuestionList()[index].getAnswerOptionList()[number].getAnswerText();
		const result = {};
		if (/youtube/.test(answerText)) {
			result.origin  = "https://www.youtube.com/embed/";
			result.videoId = answerText.substr(answerText.lastIndexOf("=") + 1, answerText.length);
		} else if (/youtu.be/.test(answerText)) {
			result.origin  = "https://www.youtube.com/embed/";
			result.videoId = answerText.substr(answerText.lastIndexOf("/") + 1, answerText.length);
		} else if (/vimeo/.test(answerText)) {
			result.origin = "https://player.vimeo.com/video/";
			result.videoId = answerText.substr(answerText.lastIndexOf("/") + 1, answerText.length);
		}
		result.videoId = result.videoId.replace(/script/g, "");
		result.embedTag = '<embed width="100%" height="100%" src="' + result.origin + result.videoId + '?html5=1&amp;rel=0&amp;hl=en_US&amp;version=3" type="text/html" allowscriptaccess="always" allowfullscreen="true" />';
		return result;
	},
	answerOptionLetter: function (number) {
		return String.fromCharCode((number + 65));
	},
	isRangedQuestion: function () {
		const index = parseInt(Router.current().params.questionIndex) || EventManagerCollection.findOne().questionIndex;
		return Session.get("questionGroup").getQuestionList()[index].typeName() === "RangedQuestion";
	},
	isFreeTextQuestion: function () {
		const index = parseInt(Router.current().params.questionIndex) || EventManagerCollection.findOne().questionIndex;
		return Session.get("questionGroup").getQuestionList()[index].typeName() === "FreeTextQuestion";
	}
});

Template.votingviewTitel.helpers({
	getCountdown: function () {
		if (this.data && this.data["data-questionIndex"]) {
			return false;
		}
		let countdownValue = Session.get("countdownInitialized") && lib.countdown ? lib.countdown.get() : 0;
		return TAPi18n.__("view.voting.seconds_left", {value: countdownValue, count: countdownValue});
	}
});
