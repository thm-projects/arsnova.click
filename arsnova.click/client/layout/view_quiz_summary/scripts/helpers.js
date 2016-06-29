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
import {NicknameCategoriesCollection} from '/lib/nickname_categories/collection.js';
import {getQuestionTypes} from '/client/layout/view_questions/scripts/lib.js';

Template.quizSummary.helpers({
	getSessionName: function () {
		if (!Session.get("questionGroup")) {
			return;
		}
		return Session.get("questionGroup").getHashtag();
	},
	getSessionUrl: function () {
		if (!Session.get("questionGroup")) {
			return;
		}
		return window.location.protocol + "//" + window.location.host + "/" + Session.get("questionGroup").getHashtag();
	},
	getQuestionCount: function () {
		if (!Session.get("questionGroup")) {
			return;
		}
		return Session.get("questionGroup").getQuestionList().length;
	},
	getQuestions: function () {
		if (!Session.get("questionGroup")) {
			return;
		}
		return Session.get("questionGroup").getQuestionList();
	},
	getNormalizedIndex: function (index) {
		return index + 1;
	},
	getIsCorrectAnswerOption: function (isCorrect) {
		return isCorrect ? "view.quiz_summary.correct" : "view.quiz_summary.wrong";
	},
	getQuestionTypeTranslation: function (id) {
		const questionTypes = getQuestionTypes();
		for (let i = 0; i < questionTypes.length; i++) {
			if (questionTypes[i].id === id) {
				return questionTypes[i].translationName;
			}
		}
	},
	isQuestionGroupValid: function () {
		if (!Session.get("questionGroup")) {
			return;
		}
		return Session.get("questionGroup").isValid();
	},
	getQuestionGroupValidation: function () {
		if (!Session.get("questionGroup")) {
			return;
		}
		return Session.get("questionGroup").isValid() ? "view.quiz_summary.successful" : "view.quiz_summary.failed";
	},
	getValidationStatus: function (question) {
		return question.isValid() ? "view.quiz_summary.successful" : "view.quiz_summary.failed";
	},
	getValidationErrors: function (question) {
		return question.getValidationStackTrace();
	},
	isLastItem: function (index) {
		if (!Session.get("questionGroup")) {
			return;
		}
		return index === Session.get("questionGroup").getQuestionList().length - 1;
	},
	isQuestionType: function (type) {
		return type === "question";
	},
	getTranslationForType: function (type) {
		return "view.quiz_summary.validation_errors.types." + type;
	},
	getTranslationForReason: function (reason) {
		return "view.quiz_summary.validation_errors.reasons." + reason;
	},
	selectedNicks: function () {
		if (!Session.get("questionGroup") || !Session.get("showSelectedNicks")) {
			return;
		}
		let result = "";
		NicknameCategoriesCollection.find({_id: {$in: Session.get("questionGroup").getSelectedNicks()}}, {sort: {nick: 1}}).fetch().forEach(function (item) {
			result += item.nick + ", ";
		});
		return result.slice(0, result.length - 2);
	},
	noSelectedNicks: function () {
		return Session.get("questionGroup").getSelectedNicks().length === 0;
	},
	getShowSelectedNicksText: function () {
		if (Session.get("showSelectedNicks") === true) {
			return "view.quiz_summary.hide_selected_nicks";
		} else {
			return "view.quiz_summary.show_selected_nicks";
		}
	},
	selectedNicksCount: function () {
		if (!Session.get("questionGroup")) {
			return;
		}
		return Session.get("questionGroup").getSelectedNicks().length;
	},
	isVotingQuestion: function (questionType) {
		return questionType === "SurveyQuestion";
	},
	isRangedQuestion: function (questionType) {
		return questionType === "RangedQuestion";
	},
	isFreeTextQuestion: function (questionType) {
		return questionType === "FreeTextQuestion";
	}
});
