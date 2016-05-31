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
import {getQuestionTypes} from '/client/layout/view_questions/scripts/lib.js';

Template.quizSummary.helpers({
	getSessionName: function () {
		return Session.get("questionGroup").getHashtag();
	},
	getSessionUrl: function () {
		return window.location.protocol + "//" + window.location.host + "/" + Session.get("questionGroup").getHashtag();
	},
	getQuestionCount: function () {
		return Session.get("questionGroup").getQuestionList().length;
	},
	getQuestions: function () {
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
		return Session.get("questionGroup").isValid();
	},
	getQuestionGroupValidation: function () {
		return Session.get("questionGroup").isValid() ? "view.quiz_summary.successful" : "view.quiz_summary.failed";
	},
	getValidationStatus: function (question) {
		return question.isValid() ? "view.quiz_summary.successful" : "view.quiz_summary.failed";
	},
	getValidationErrors: function (question) {
		return question.getValidationStackTrace();
	},
	isLastItem: function (index) {
		return index === Session.get("questionGroup").getQuestionList().length - 1;
	},
	getTranslationForType: function (type) {
		return "view.quiz_summary.validation_errors.types." + type;
	},
	getTranslationForReason: function (reason) {
		return "view.quiz_summary.validation_errors.reasons." + reason;
	}
});
