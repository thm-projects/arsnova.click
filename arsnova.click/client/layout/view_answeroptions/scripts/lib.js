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
import {Tracker} from 'meteor/tracker';
import {jQuery} from 'meteor/jquery';
import {noUiSlider} from 'meteor/arsnova.click:nouislider';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {TAPi18n} from 'meteor/tap:i18n';
import {Router} from 'meteor/iron:router';
import {answerTextSchema} from '/lib/answeroptions/collection.js';
import {calculateHeaderSize, calculateTitelHeight} from '/client/layout/region_header/lib.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";
import {ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import {getTooltipForRoute} from "/client/layout/global/scripts/lib.js";
import * as localData from '/lib/local_storage.js';

export const answerOptionTracker = new Tracker.Dependency();
export const answerCheckTracker = new Tracker.Dependency();

export function parseAnswerOptionInput(index) {
	const questionItem = Session.get("questionGroup");
	const answerlist = questionItem.getQuestionList()[index].getAnswerOptionList();

	for (let i = 0; i < answerlist.length; i++) {
		answerlist[i].setAnswerText($("#answerOptionText_Number" + i).val());
		answerlist[i].setIsCorrect($('#answerOption-' + i).find(".check-mark-checked").length > 0);
	}
	Session.set("questionGroup", questionItem);
	localData.addHashtag(Session.get("questionGroup"));
}

export function parseSingleAnswerOptionInput(questionIndex, answerOptionIndex) {
	const answerText = $("#answerOptionText_Number" + answerOptionIndex).val();
	try {
		new SimpleSchema({
			answerText: answerTextSchema
		}).validate({answerText: answerText});
	} catch (ex) {
		new ErrorSplashscreen({
			autostart: true,
			errorMessage: "plugins.splashscreen.error.error_messages.invalid_input_data"
		});
		return;
	}
	const questionItem = Session.get("questionGroup");
	questionItem.getQuestionList()[questionIndex].getAnswerOptionList()[answerOptionIndex].setAnswerText(answerText);
	Session.set("questionGroup", questionItem);
	localData.addHashtag(Session.get("questionGroup"));
}

export function calculateXsViewport() {
	if ($(window).height() < 400) {
		$('.navbar-footer').hide();
		$('#appTitle').hide();
		$('.fixed-bottom').css("bottom", 0);
		calculateHeaderSize();
		calculateTitelHeight();
	} else {
		$('.navbar-footer').show();
		$('#appTitle').show();
		calculateHeaderSize();
		calculateTitelHeight();
		footerElements.calculateFooter();
	}
}

export function formatIsCorrectButtons() {
	if (Session.get("loading_language")) {
		return;
	}
	$("[name='switch']").bootstrapToggle({
		size: "small",
		onstyle: "success",
		offstyle: "danger",
		on: TAPi18n.__("view.answeroptions.correct"),
		off: TAPi18n.__("view.answeroptions.wrong")
	});
}

export function formatFreeTextSettingsButtons() {
	if (Session.get("loading_language")) {
		return;
	}
	$("[name='switch']").bootstrapToggle();
}

export function createSlider(index) {
	const questionItem = Session.get("questionGroup");
	const plainSlider = document.getElementById('rangedSlider');
	let sliderObject = noUiSlider.create(plainSlider, {
		step: 1,
		margin: 1,
		connect: true,
		behaviour: 'tap-drag',
		start: [questionItem.getQuestionList()[index].getMinRange(), questionItem.getQuestionList()[index].getMaxRange()],
		range: {
			'min': 0,
			'max': questionItem.getQuestionList()[index].getMaxRange() + 50 || 100
		}
	});
	sliderObject.on('slide', function (val) {
		const minRange = parseFloat(val[0]);
		const maxRange = parseFloat(val[1]);
		sliderObject.updateOptions({
			margin: 1,
			range: {
				'min': [0],
				'max': [minRange > maxRange ? minRange + 50 : maxRange + 50]
			}
		});
		const correctValue = $('#correctValueInput');
		try {
			correctValue.val(Math.round((minRange + maxRange) / 2));
			questionItem.getQuestionList()[index].setCorrectValue(parseInt(correctValue.val()));
			questionItem.getQuestionList()[index].setRange(minRange, maxRange);
			Session.set("questionGroup", questionItem);
			localData.addHashtag(questionItem);
			$('#minRangeInput, #maxRangeInput').removeClass("invalid");
		} catch (ex) {
			$('#minRangeInput, #maxRangeInput').addClass("invalid");
		}
	});
	$('#minRangeInput, #maxRangeInput').on("change", function () {
		const minRange = parseFloat($('#minRangeInput').val());
		const maxRange = parseFloat($('#maxRangeInput').val());
		if (typeof minRange !== "undefined" && typeof maxRange !== "undefined") {
			const newMaxRange = minRange > maxRange ? minRange + 50 : maxRange + 50;
			sliderObject.updateOptions({
				margin: 1,
				range: {
					'min': [0],
					'max': [newMaxRange]
				}
			});
			sliderObject.set([minRange, newMaxRange - 50]);
			try {
				questionItem.getQuestionList()[index].setRange(minRange, maxRange);
				Session.set("questionGroup", questionItem);
				localData.addHashtag(questionItem);
				$('#minRangeInput, #maxRangeInput').removeClass("invalid");
			} catch (ex) {
				$('#minRangeInput, #maxRangeInput').addClass("invalid");
			}
			const correctValue = $('#correctValueInput');
			if (correctValue.val() < minRange || correctValue.val() > maxRange) {
				correctValue.addClass("invalid");
			} else {
				correctValue.removeClass("invalid");
			}
		}
	});
	$('#correctValueInput').on("change", function () {
		const correctValueInputField = $('#correctValueInput');
		const value = parseFloat(correctValueInputField.val());
		questionItem.getQuestionList()[Router.current().params.questionIndex].setCorrectValue(value);
		Session.set("questionGroup", questionItem);
		localData.addHashtag(questionItem);
		correctValueInputField.removeClass("invalid");
		$.each(Session.get("questionGroup").getQuestionList()[Router.current().params.questionIndex].getValidationStackTrace(), function (index, element) {
			if (element.reason === "invalid_correct_value") {
				correctValueInputField.addClass("invalid");
				return false;
			}
		});
	});
}

export function setSlider(index) {
	const questionItem = Session.get("questionGroup");
	$("#slider").val((questionItem.getQuestionList()[index].getTimer()));
}

export function styleFreetextAnswerOptionValidation(isValid) {
	if (isValid) {
		$('#answerTextArea').removeClass("invalidQuestion");
	} else {
		$('#answerTextArea').addClass("invalidQuestion");
	}
}

(function ($) {
	$.fn.getCursorPosition = function () {
		const input = this.get(0);
		if (!input) { // No (input) element found
			return;
		}
		if ('selectionStart' in input) {
			// Standard-compliant browsers
			return input.selectionStart;
		} else if (document.selection) {
			// IE
			input.focus();
			const sel = document.selection.createRange();
			const selLen = document.selection.createRange().text.length;
			sel.moveStart('character', -input.value.length);
			return sel.text.length - selLen;
		}
	};
	$.fn.setCaretPosition = function (caretPos) {
		let range;
		const elem = this.get(0);
		if (!elem) { // No (input) element found
			return;
		}

		if (elem.createTextRange) {
			range = elem.createTextRange();
			range.move('character', caretPos);
			range.select();
		} else {
			elem.focus();
			if (elem.selectionStart !== undefined) {
				elem.setSelectionRange(caretPos, caretPos);
			}
		}
	};
	$.fn.setCursorPosition = function (pos) {
		this.each(function (index, elem) {
			if (elem.setSelectionRange) {
				elem.setSelectionRange(pos, pos);
			} else if (elem.createTextRange) {
				const range = elem.createTextRange();
				range.collapse(true);
				range.moveEnd('character', pos);
				range.moveStart('character', pos);
				range.select();
			}
		});
		return this;
	};
})(jQuery);

export const renderAnsweroptionItems = function () {
	if (Session.get("loading_language")) {
		return;
	}
	$('#answerOptionWrapper').html("");
	const questionItem = Session.get("questionGroup").getQuestionList()[Router.current().params.questionIndex];
	const typeName = questionItem.typeName();
	questionItem.getAnswerOptionList().forEach(function (item) {
		const number = item.getAnswerOptionNumber();
		const answerWrapper = $("<div class='answerOptionElementWrapper' style='position:relative;' />");
		answerWrapper.append(
			"<div class='answer_row_short_text'>" + String.fromCharCode(number + 65) + "</div>"
		).append(
			"<input type='text' class='answer_row_text tabbable' id='answerOptionText_Number" + number + "' placeholder='" + TAPi18n.__("view.answeroptions.answeroptiontext_placeholder") + "' value='" + item.getAnswerText() + "' aria-valuenow='" + item.getAnswerText() + "' maxlength='" + answerTextSchema.max + "' aria-multiline='false' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false' />"
		);
		if (typeName !== "SurveyQuestion") {
			answerWrapper.append(
				$("<input type='checkbox' role='switch' id='answerOption-" + number + "' name='switch' data-width='80' title='answerOption-" + number + "' class='tabbable isCorrectOption tabbable'/>").prop('checked', item.getIsCorrect())
			);
		}
		const contextMenu = $('<div class="contextMenu"/>').append(
			"<div class='moveAnsweroptionUp text-light contextMenuItem'><span class='glyphicon glyphicon-chevron-up' aria-hidden='true'></span></div>",
			"<div class='moveAnsweroptionDown text-light contextMenuItem'><span class='glyphicon glyphicon-chevron-down' aria-hidden='true'></span></div>"
		);
		if (typeName !== "YesNoSingleChoiceQuestion" && typeName !== "TrueFalseSingleChoiceQuestion") {
			contextMenu.append(
				"<div class='removeAnsweroption text-light contextMenuItem'><span class='glyphicon glyphicon-trash' aria-hidden='true'></span></div>"
			);
		}
		answerWrapper.append(contextMenu);
		$('#answerOptionWrapper').append($("<div id='" + number + "_answeroption' class='draggable' role='listitem'></div>").append(answerWrapper).append(contextMenu));
	});
	const configShowAnswerContentOnButtonsState = questionItem.getDisplayAnswerText() ? "on" : "off";
	$('#config_showAnswerContentOnButtons_switch').bootstrapToggle(configShowAnswerContentOnButtonsState);
	if (typeName === "SurveyQuestion") {
		const configMultipleSelectionEnabledState = questionItem.getMultipleSelectionEnabled() ? "on" : "off";
		$('#config_multipleSelectionSurvey_switch').bootstrapToggle(configMultipleSelectionEnabledState);
	}
	formatIsCorrectButtons();
	const firstAnswerElement = $("[data-id=0]");
	firstAnswerElement.find(".answer_row_short_text").attr("data-intro", TAPi18n.__("view.answeroptions.description.added_answer_short_text"));
	firstAnswerElement.find(".answer_row_text").attr("data-intro", TAPi18n.__("view.answeroptions.description.added_answer_text"));
	firstAnswerElement.find(".toggle").attr("data-intro", TAPi18n.__("view.answeroptions.description.added_answer_is_correct"));
	firstAnswerElement.find(".removeAnsweroption").attr("data-intro", TAPi18n.__("view.answeroptions.description.added_answer_remove"));
	getTooltipForRoute();
};
