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
import {Router} from 'meteor/iron:router';

Template.createAnswerOptions.helpers({
	renderTemplate: function () {
		if (!Session.get("questionGroup")) {
			return null;
		}
		switch (Session.get("questionGroup").getQuestionList()[Router.current().params.questionIndex].typeName()) {
			case "SingleChoiceQuestion":
			case "YesNoSingleChoiceQuestion":
			case "TrueFalseSingleChoiceQuestion":
			case "MultipleChoiceQuestion":
			case "SurveyQuestion":
				return Template.defaultAnswerOptionTemplate;
			case "RangedQuestion":
				return Template.rangedAnswerOptionTemplate;
			case "FreeTextQuestion":
				return Template.freeTextAnswerOptionTemplate;
			default:
				console.log("Template for unknown question group is requested.");
				return null;
		}
	}
});

Template.defaultAnswerOptionTemplate.helpers({
	getQuestionIndex: function () {
		return Router.current().params.questionIndex;
	},
	answerOptionLetter: function (Nr) {
		return String.fromCharCode(Nr + 65);
	},
	showDeleteButtonOnStart: function () {
		if (!Session.get("questionGroup")) {
			return;
		}
		return Session.get("questionGroup").getQuestionList()[Router.current().params.questionIndex].getAnswerOptionList().length === 1 ? "hide" : "";
	},
	isValidAnswerOption: function (item) {
		return item.isValid();
	},
	isSurveyQuestion: function () {
		if (!Session.get("questionGroup")) {
			return;
		}
		return Session.get("questionGroup").getQuestionList()[Router.current().params.questionIndex].typeName() === "SurveyQuestion";
	},
	canAddAnsweroption: function () {
		switch (Session.get("questionGroup").getQuestionList()[Router.current().params.questionIndex].typeName()) {
			case "SingleChoiceQuestion":
			case "MultipleChoiceQuestion":
			case "SurveyQuestion":
				return true;
			default:
				return false;
		}
	}
});

Template.rangedAnswerOptionTemplate.helpers({
	getMinValue: function () {
		if (!Session.get("questionGroup")) {
			return;
		}
		return Session.get("questionGroup").getQuestionList()[Router.current().params.questionIndex].getMinRange();
	},
	getMaxValue: function () {
		if (!Session.get("questionGroup")) {
			return;
		}
		return Session.get("questionGroup").getQuestionList()[Router.current().params.questionIndex].getMaxRange();
	},
	getCorrectValue: function () {
		if (!Session.get("questionGroup")) {
			return;
		}
		return Session.get("questionGroup").getQuestionList()[Router.current().params.questionIndex].getCorrectValue();
	}
});

Template.freeTextAnswerOptionTemplate.helpers({
	configOptions: function () {
		return [
			{id: "config_case_sensitive", textName: "view.answeroptions.free_text_question.config_case_sensitive"},
			{id: "config_trim_whitespaces", textName: "view.answeroptions.free_text_question.config_trim_whitespaces"},
			{id: "config_use_keywords", textName: "view.answeroptions.free_text_question.config_use_keywords"},
			{id: "config_use_punctuation", textName: "view.answeroptions.free_text_question.config_use_punctuation"}
		];
	},
	answerText: function () {
		if (!Session.get("questionGroup")) {
			return;
		}
		return Session.get("questionGroup").getQuestionList()[Router.current().params.questionIndex].getAnswerOptionList()[0].getAnswerText();
	}
});
