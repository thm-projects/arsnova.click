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
import {Template} from 'meteor/templating';
import {Router} from 'meteor/iron:router';
import * as localData from '/lib/local_storage.js';
import * as lib from './lib.js';

Template.createAnswerOptions.events({
});

Template.defaultAnswerOptionTemplate.events({
	"click #default_answer_row": function () {
		const questionGroup = Session.get("questionGroup");
		questionGroup.getQuestionList()[Router.current().params.questionIndex].addDefaultAnswerOption(-1);
		Session.set("questionGroup", questionGroup);
		localData.addHashtag(Session.get("questionGroup"));
	},
	"change .isCorrectOption": function (event) {
		const checked = $(event.target).prop('checked');
		const id = event.target.id.replace("answerOption-","");
		const questionItem = Session.get("questionGroup");
		if (checked && questionItem.getQuestionList()[Router.current().params.questionIndex].typeName() !== "MultipleChoiceQuestion") {
			for (let i = 0; i < questionItem.getQuestionList()[Router.current().params.questionIndex].getAnswerOptionList().length; i++) {
				if (i === id) {
					continue;
				}
				questionItem.getQuestionList()[Router.current().params.questionIndex].getAnswerOptionList()[i].setIsCorrect(false);
				$('#answerOption-' + i).prop('checked', false).change();
			}
		}
		questionItem.getQuestionList()[Router.current().params.questionIndex].getAnswerOptionList()[id].setIsCorrect(checked);
		Session.set("questionGroup", questionItem);
		localData.addHashtag(Session.get("questionGroup"));
	},
	"change #config_showAnswerContentOnButtons_switch": function (event) {
		const checked = $(event.target).prop('checked');
		const questionItem = Session.get("questionGroup");
		questionItem.getQuestionList()[Router.current().params.questionIndex].setDisplayAnswerText(checked);
		Session.set("questionGroup", questionItem);
		localData.addHashtag(Session.get("questionGroup"));
		Meteor.defer(function () {
			lib.answerOptionTracker.changed();
		});
	},
	"change #config_multipleSelectionSurvey_switch": function (event) {
		const checked = $(event.target).prop('checked');
		const questionItem = Session.get("questionGroup");
		questionItem.getQuestionList()[Router.current().params.questionIndex].setMultipleSelectionEnabled(checked);
		Session.set("questionGroup", questionItem);
		localData.addHashtag(Session.get("questionGroup"));
	},
	"change #config_showOneAnswerPerRow_switch": function (event) {
		const checked = $(event.target).prop('checked');
		const questionItem = Session.get("questionGroup");
		questionItem.getQuestionList()[Router.current().params.questionIndex].setShowOneAnswerPerRow(checked);
		Session.set("questionGroup", questionItem);
		localData.addHashtag(Session.get("questionGroup"));
	},
	"click .moveAnsweroptionUp": function (event) {
		event.stopPropagation();
		event.preventDefault();
		const questionGroup = Session.get("questionGroup");
		const indexFrom = parseInt($(event.currentTarget).parents(".answerElementContextWrapper").attr("id").replace("_answeroption", ""));
		if (indexFrom > 0) {
			const item = questionGroup.getQuestionList()[Router.current().params.questionIndex].getAnswerOptionList()[indexFrom];
			questionGroup.getQuestionList()[Router.current().params.questionIndex].removeAnswerOption(indexFrom);
			questionGroup.getQuestionList()[Router.current().params.questionIndex].addAnswerOption(item, indexFrom - 1);
			Session.set("questionGroup", questionGroup);
			localData.addHashtag(Session.get("questionGroup"));
		}
	},
	"click .moveAnsweroptionDown": function (event) {
		event.stopPropagation();
		event.preventDefault();
		const questionGroup = Session.get("questionGroup");
		const indexFrom = parseInt($(event.currentTarget).parents(".answerElementContextWrapper").attr("id").replace("_answeroption", ""));
		if (indexFrom < questionGroup.getQuestionList()[Router.current().params.questionIndex].getAnswerOptionList().length - 1) {
			const item = questionGroup.getQuestionList()[Router.current().params.questionIndex].getAnswerOptionList()[indexFrom];
			questionGroup.getQuestionList()[Router.current().params.questionIndex].removeAnswerOption(indexFrom);
			questionGroup.getQuestionList()[Router.current().params.questionIndex].addAnswerOption(item, indexFrom + 1);
			Session.set("questionGroup", questionGroup);
			localData.addHashtag(Session.get("questionGroup"));
		}
	},
	"click .removeAnsweroption": function (event) {
		event.stopPropagation();
		event.preventDefault();
		const questionItem = Session.get("questionGroup");
		questionItem.getQuestionList()[Router.current().params.questionIndex].removeAnswerOption($(event.currentTarget).parents(".answerElementContextWrapper").attr("id").replace("_answeroption", ""));
		Session.set("questionGroup", questionItem);
		localData.addHashtag(Session.get("questionGroup"));
		Meteor.defer(function () {
			lib.answerOptionTracker.changed();
		});
	},
	"input .answer_row_text": function (event) {
		const id = $(event.currentTarget).attr("id");
		const plainId = id.replace("answerOptionText_Number","");
		const cursorPosition = $("#" + id).getCursorPosition();
		lib.parseSingleAnswerOptionInput(Router.current().params.questionIndex, plainId);
		Meteor.defer(function () {
			$("#" + id).setCursorPosition(cursorPosition).focus();
			lib.answerOptionTracker.changed();
		});
	}
});

Template.freeTextAnswerOptionTemplate.events({
	"change [name='switch']": function (event) {
		const questionItem = Session.get("questionGroup");
		questionItem.getQuestionList()[Router.current().params.questionIndex].getAnswerOptionList()[0].setConfig(event.target.id, $(event.target).prop("checked"));
		if (event.target.id === "config_use_keywords_switch") {
			if ($('#config_use_keywords_switch').prop("checked")) {
				$('#config_trim_whitespaces_switch').bootstrapToggle('enable');
				$('#config_use_punctuation_switch').bootstrapToggle('enable');
			} else {
				$('#config_trim_whitespaces_switch').bootstrapToggle('off').bootstrapToggle('disable');
				$('#config_use_punctuation_switch').bootstrapToggle('off').bootstrapToggle('disable');
				questionItem.getQuestionList()[Router.current().params.questionIndex].getAnswerOptionList()[0].setConfig("config_trim_whitespaces_switch", false);
				questionItem.getQuestionList()[Router.current().params.questionIndex].getAnswerOptionList()[0].setConfig("config_use_punctuation_switch", false);
			}
		}
		Session.set("questionGroup", questionItem);
		localData.addHashtag(questionItem);
	},
	"input #answerTextArea": function (event) {
		const questionItem = Session.get("questionGroup");
		const questionIndex = Router.current().params.questionIndex;
		questionItem.getQuestionList()[questionIndex].getAnswerOptionList()[0].setAnswerText($(event.currentTarget).val());
		lib.styleFreetextAnswerOptionValidation(questionItem.getQuestionList()[questionIndex].getAnswerOptionList()[0].isValid());
		Session.set("questionGroup", questionItem);
		localData.addHashtag(Session.get("questionGroup"));
	},
	"input #answerCheckArea": function () {
		lib.answerCheckTracker.changed();
	}
});
