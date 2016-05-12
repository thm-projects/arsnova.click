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
import {Template} from 'meteor/templating';
import {TAPi18n} from 'meteor/tap:i18n';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {AnswerOptionCollection} from '/lib/answeroptions/collection.js';
import * as localData from '/lib/local_storage.js';
import {ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import {parseAnswerOptionInput} from './lib.js';

Template.createAnswerOptions.events({
	"click .toggleCorrect": function (event) {
		if (this.isCorrect) {
			this.isCorrect = 0;
			$(event.currentTarget.firstElementChild).removeClass("check-mark-checked");
			$(event.currentTarget.firstElementChild).addClass("check-mark-unchecked");
		} else {
			this.isCorrect = 1;
			$(event.currentTarget.firstElementChild).removeClass("check-mark-unchecked");
			$(event.currentTarget.firstElementChild).addClass("check-mark-checked");
		}
	},
	"click #addAnswerOption": function () {
		var answerOptionsCount = AnswerOptionCollection.find({questionIndex: EventManagerCollection.findOne().questionIndex}).count();
		if (answerOptionsCount < 26) {
			const answerOption = {
				hashtag: Router.current().params.quizName,
				questionIndex: EventManagerCollection.findOne().questionIndex,
				answerText: "",
				answerOptionNumber: answerOptionsCount,
				isCorrect: 0
			};

			Meteor.call('AnswerOptionCollection.addOption', answerOption, (err) => {
				if (err) {
					$('.errorMessageSplash').parents('.modal').modal('show');
					$("#errorMessage-text").html(err.reason);
				} else {
					localData.addAnswers(answerOption);

					$("#deleteAnswerOption").removeClass("hide");

					answerOptionsCount++;
					if (answerOptionsCount > 25) {
						$("#addAnswerOption").addClass("hide");
					}

					$('.answer-options').scrollTop($('.answer-options')[0].scrollHeight);

					$('#answerOptionText_Number' + (answerOptionsCount - 1)).closest(".input-group").addClass("invalidAnswerOption");
				}
			});
		}
	},
	"click #deleteAnswerOption": function () {
		var answerOptionsCount = AnswerOptionCollection.find({questionIndex: EventManagerCollection.findOne().questionIndex}).count();
		if (answerOptionsCount > 1) {
			$("#addAnswerOption").removeClass("hide");

			Meteor.call('AnswerOptionCollection.deleteOption', {
				hashtag: Router.current().params.quizName,
				questionIndex: EventManagerCollection.findOne().questionIndex,
				answerOptionNumber: answerOptionsCount - 1
			});
			localData.deleteAnswerOption(Router.current().params.quizName, EventManagerCollection.findOne().questionIndex, answerOptionsCount - 1);

			answerOptionsCount--;
			if (answerOptionsCount === 1) {
				$("#deleteAnswerOption").addClass("hide");
			} else if (answerOptionsCount > 2) {
				$('.answer-options').scrollTop($('.answer-options')[0].scrollHeight);
			}
		}
	},
	"click #backButton": function () {
		var err = parseAnswerOptionInput(EventManagerCollection.findOne().questionIndex);

		if (err) {
			new ErrorSplashscreen({
				autostart: true,
				errorMessage: TAPi18n.__("plugins.splashscreen.error.error_messages." + err.reason)
			});
		} else {
			Router.go("/" + Router.current().params.quizName + "/question");
		}
	},
	"click #forwardButton": function () {
		parseAnswerOptionInput(EventManagerCollection.findOne().questionIndex);
		Router.go("/" + Router.current().params.quizName + "/settimer");
	},
	"keydown .input-field": function (event) {
		if ((event.keyCode === 9 || event.keyCode === 13) && !event.shiftKey) {
			var nextElement = $(event.currentTarget).closest(".form-group").next();
			if (nextElement.length <= 0) {
				event.preventDefault();
				$("#addAnswerOption").click();
				//sets focus to the new input field
				$(event.currentTarget).closest(".form-group").next().find(".input-field").focus();
			}
		}
	},
	"keyup .input-field": function (event) {
		if ($(event.currentTarget).val().length === 0) {
			$(event.currentTarget).closest(".input-group").addClass("invalidAnswerOption");
		} else {
			$(event.currentTarget).closest(".input-group").removeClass("invalidAnswerOption");
		}
	}
});
