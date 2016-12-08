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
import {DefaultQuestionGroup} from '/lib/questions/questiongroup_default.js';
import {AnswerOptionCollection} from '/lib/answeroptions/collection.js';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {mathjaxMarkdown} from '/client/lib/mathjax_markdown.js';
import * as lib from './lib.js';

Template.votingview.helpers({
	answerOptions: function () {
		if (this["data-questionIndex"]) {
			return Session.get("questionGroup").getQuestionList()[parseInt(this["data-questionIndex"])].getAnswerOptionList();
		}
		return AnswerOptionCollection.find({questionIndex: EventManagerCollection.findOne().questionIndex}, {sort: {answerOptionNumber: 1}});
	},
	showQuestionButton: function () {
		return !this["data-questionIndex"];
	},
	showForwardButton: function () {
		if (this["data-questionIndex"]) {
			return false;
		}
		return Session.get("hasToggledResponse") && !(Session.get("hasSendResponse"));
	},
	answerOptionLetter: function (number) {
		let questionItem;
		if (Template.parentData()["data-questionIndex"]) {
			questionItem = Session.get("questionGroup").getQuestionList()[parseInt(Template.parentData()["data-questionIndex"])];
		} else {
			questionItem = new DefaultQuestionGroup(QuestionGroupCollection.findOne());
		}
		const allAnswerTexts = questionItem.getAnswerOptionList();
		const answer = allAnswerTexts[number.hash.number];
		if (!answer || answer.getAnswerText().length === 0 || !questionItem.getDisplayAnswerText()) {
			return String.fromCharCode((number.hash.number + 65));
		} else {
			if (answer.getAnswerText().length === answer.getAnswerTextLengthWithoutMarkdownChars()) {
				return answer.getAnswerText();
			}
			return mathjaxMarkdown.getContent(answer.getAnswerText());
		}
	},
	isRangedQuestion: function () {
		if (this["data-questionIndex"]) {
			return Session.get("questionGroup").getQuestionList()[parseInt(this["data-questionIndex"])].typeName() === "RangedQuestion";
		}
		return QuestionGroupCollection.findOne().questionList[EventManagerCollection.findOne().questionIndex].type === "RangedQuestion";
	},
	isFreeTextQuestion: function () {
		if (this["data-questionIndex"]) {
			return Session.get("questionGroup").getQuestionList()[parseInt(this["data-questionIndex"])].typeName() === "FreeTextQuestion";
		}
		return QuestionGroupCollection.findOne().questionList[EventManagerCollection.findOne().questionIndex].type === "FreeTextQuestion";
	}
});

Template.votingviewTitel.helpers({
	getCountdown: function () {
		if (this["data-questionIndex"]) {
			return false;
		}
		let countdownValue = Session.get("countdownInitialized") && lib.countdown ? lib.countdown.get() : 0;
		return TAPi18n.__("view.voting.seconds_left", {value: countdownValue, count: countdownValue});
	}
});
