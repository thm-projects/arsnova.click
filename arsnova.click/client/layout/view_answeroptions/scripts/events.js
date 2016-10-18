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
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import * as localData from '/lib/local_storage.js';
import {parseSingleAnswerOptionInput, formatIsCorrectButtons} from './lib.js';

Template.createAnswerOptions.events({
	"click #backButton": function () {
		Router.go("/" + Router.current().params.quizName + "/question");
	},
	"click #forwardButton": function () {
		Router.go("/" + Router.current().params.quizName + "/settimer");
	}
});

Template.defaultAnswerOptionTemplate.events({
	"click #addAnswerOption": function () {
		const questionItem = Session.get("questionGroup");
		const answerlist = questionItem.getQuestionList()[EventManagerCollection.findOne().questionIndex];
		let answerOptionsCount = answerlist.getAnswerOptionList().length;

		if (answerOptionsCount < 26) {
			answerlist.addDefaultAnswerOption(answerOptionsCount);
			Session.set("questionGroup", questionItem);
			localData.addHashtag(Session.get("questionGroup"));
			$("#deleteAnswerOption").removeClass("hide");

			answerOptionsCount++;
			if (answerOptionsCount > 25) {
				$("#addAnswerOption").addClass("hide");
			}

			const answerOptionsField = $('.answer-options');
			answerOptionsField.scrollTop(answerOptionsField[0].scrollHeight);

			setTimeout(formatIsCorrectButtons, 20);
		}
	},
	"click #deleteAnswerOption": function () {
		const questionItem = Session.get("questionGroup");
		const answerlist = questionItem.getQuestionList()[EventManagerCollection.findOne().questionIndex];
		let answerOptionsCount = answerlist.getAnswerOptionList().length;

		if (answerOptionsCount > 1) {
			$("#addAnswerOption").removeClass("hide");

			answerlist.removeAnswerOption(answerOptionsCount - 1);
			Session.set("questionGroup", questionItem);
			localData.addHashtag(Session.get("questionGroup"));

			answerOptionsCount--;
			if (answerOptionsCount === 1) {
				$("#deleteAnswerOption").addClass("hide");
			} else if (answerOptionsCount > 2) {
				const answerOptionsField = $('.answer-options');
				answerOptionsField.scrollTop(answerOptionsField[0].scrollHeight);
			}
		}
	},
	"keydown .input-field": function (event) {
		if ((event.keyCode === 9) && !event.shiftKey) {
			var nextElement = $(event.currentTarget).closest(".form-group").next();
			if (nextElement.length <= 0) {
				event.preventDefault();
				$("#addAnswerOption").click();
				//sets focus to the new input field - The field is not added instantly because of the sync to the localStorage so we need a small timeout here
				const renderTimeoutFunction = function () {
					if ($(event.currentTarget).closest(".form-group").next().find(".input-field").length > 0) {
						$(event.currentTarget).closest(".form-group").next().find(".input-field").focus();
					} else {
						Meteor.setTimeout(renderTimeoutFunction, 20);
					}
				};
				Meteor.setTimeout(renderTimeoutFunction, 20);
			}
		}
	},
	"input .input-field": function (event) {
		parseSingleAnswerOptionInput(EventManagerCollection.findOne().questionIndex, $(event.currentTarget).attr("id").replace("answerOptionText_Number",""));
	}
});

Template.freeTextAnswerOptionTemplate.events({
	"input #answerTextArea": function (event) {
		const questionItem = Session.get("questionGroup");

		questionItem.getQuestionList()[EventManagerCollection.findOne().questionIndex].getAnswerOptionList()[0].setAnswerText($(event.currentTarget).val());

		Session.set("questionGroup", questionItem);
		localData.addHashtag(Session.get("questionGroup"));
	}
});
