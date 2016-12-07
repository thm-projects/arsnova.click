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
import * as headerLib from '/client/layout/region_header/lib.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";
import * as localData from '/lib/local_storage.js';
import * as lib from './lib.js';

Template.defaultAnswerOptionTemplate.onRendered(function () {
	if ($(window).width() >= 992) {
		$('#answerOptionText_Number0').focus();
	}
	this.autorun(function () {
		headerLib.titelTracker.depend();
		const mainContentContainer = $('#mainContentContainer');
		const previewAnsweroptionImage = $('#previewAnsweroptionImage');
		previewAnsweroptionImage.css("height", mainContentContainer.height() - 2);
		$('#markdownPreviewWrapper').css({
			height: previewAnsweroptionImage.height() - 140,
			width: (previewAnsweroptionImage.width() ? previewAnsweroptionImage.width() : previewAnsweroptionImage.height() / 1.7758186397984888) - 10
		});
		lib.answerOptionTracker.changed();
	}.bind(this));
	this.autorun(function () {
		lib.answerOptionTracker.depend();
		Meteor.defer(function () {
			lib.formatIsCorrectButtons();
		});
	}.bind(this));
	lib.formatIsCorrectButtons();
	$('#answerOptionWrapper').sortable({
		revert: "invalid",
		scroll: false,
		axis: 'y',
		containment: "parent",
		tolerance: "pointer",
		update: function (event, ui) {
			const questionGroup = Session.get("questionGroup");
			const indexFrom = ui.item.index();
			if (ui.item.hasClass("ui-draggable")) {
				ui.item.remove();
				questionGroup.getQuestionList()[Router.current().params.questionIndex].addDefaultAnswerOption(indexFrom);
			} else {
				const indexTo = questionGroup.getQuestionList()[Router.current().params.questionIndex].getAnswerOptionList().length;
				lib.recalculateIndices(questionGroup.getQuestionList()[Router.current().params.questionIndex], indexFrom, indexTo, true);
			}
			Session.set("questionGroup", questionGroup);
			localData.addHashtag(questionGroup);
			lib.answerOptionTracker.changed();
		}
	});
	$('#default_answer_row').draggable({
		connectToSortable: "#answerOptionWrapper",
		scroll: false,
		axis: 'y',
		appendTo: "parent",
		helper: "clone",
		revert: "invalid",
		stop: function (event, ui) {
			ui.helper.find('.answer_row_default_text').remove();
			const textFrame = $('.answer_row_text').first().clone().val("");
			const bootstrapSwitch = $('.bootstrap-switch').first().clone();
			ui.helper.append(textFrame).append(bootstrapSwitch);
		}
	}).css({"width": $('#default_answer_row').width()});
	$('.answerOptionWrapper').find('.draggable').draggable({
		connectToSortable: "#answerOptionWrapper",
		scroll: false,
		axis: 'y',
		revert: "invalid"
	}).disableSelection();
	footerElements.removeFooterElements();
	footerElements.addFooterElement(footerElements.footerElemHome);
	headerLib.calculateHeaderSize();
	headerLib.calculateTitelHeight();
});

Template.rangedAnswerOptionTemplate.onRendered(function () {
	lib.createSlider(Router.current().params.questionIndex);
	const correctValueInputField = $('#correctValueInput');
	$.each(Session.get("questionGroup").getQuestionList()[Router.current().params.questionIndex].getValidationStackTrace(), function (index, element) {
		if (element.reason === "invalid_correct_value") {
			correctValueInputField.addClass("invalid");
			return false;
		}
	});
	footerElements.removeFooterElements();
	footerElements.addFooterElement(footerElements.footerElemHome);
	headerLib.calculateHeaderSize();
	headerLib.calculateTitelHeight();
});

Template.freeTextAnswerOptionTemplate.onRendered(function () {
	lib.formatFreeTextSettingsButtons();

	const questionItem = Session.get("questionGroup");
	lib.styleFreetextAnswerOptionValidation(questionItem.getQuestionList()[Router.current().params.questionIndex].getAnswerOptionList()[0].isValid());
	footerElements.removeFooterElements();
	footerElements.addFooterElement(footerElements.footerElemHome);
	headerLib.calculateHeaderSize();
	headerLib.calculateTitelHeight();
});
