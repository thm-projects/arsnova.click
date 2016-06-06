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
import {TAPi18n} from 'meteor/tap:i18n';
import {noUiSlider} from 'meteor/arsnova.click:nouislider';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {calculateHeaderSize, calculateTitelHeight} from '/client/layout/region_header/lib.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";
import * as localData from '/lib/local_storage.js';

export var subscriptionHandler = null;

export function parseAnswerOptionInput(index) {
	const questionItem = Session.get("questionGroup");
	const answerlist = questionItem.getQuestionList()[index].getAnswerOptionList();

	for (var i = 0; i < answerlist.length; i++) {
		answerlist[i].setAnswerText($("#answerOptionText_Number" + i).val());
		answerlist[i].setIsCorrect($('#answerOption-' + i).find(".check-mark-checked").length > 0);
	}
	Session.set("questionGroup", questionItem);
	localData.addHashtag(Session.get("questionGroup"));
}

export function parseSingleAnswerOptionInput(questionIndex, answerOptionIndex) {
	const questionItem = Session.get("questionGroup");
	questionItem.getQuestionList()[questionIndex].getAnswerOptionList()[answerOptionIndex].setAnswerText($("#answerOptionText_Number" + answerOptionIndex).val());
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
	$("[name='switch']").bootstrapSwitch({
		size: "small",
		onText: TAPi18n.__("view.answeroptions.correct"),
		offText: TAPi18n.__("view.answeroptions.wrong"),
		wrapperClass: "input-field",
		animate: false,
		onSwitchChange: function (event, state) {
			const item = $('.bootstrap-switch-id-' + event.target.id);
			const questionItem = Session.get("questionGroup");
			const answerlist = questionItem.getQuestionList()[EventManagerCollection.findOne().questionIndex];
			if (state) {
				item.find('.bootstrap-switch-handle-off').addClass("hiddenImportant");
				item.find(".bootstrap-switch-container").css({width: "auto"});
				answerlist.getAnswerOptionList()[event.target.id.replace("answerOption-","")].setIsCorrect(true);
			} else {
				item.find('.bootstrap-switch-handle-off').removeClass("hiddenImportant");
				item.find(".bootstrap-switch-container").css({width: "auto"});
				answerlist.getAnswerOptionList()[event.target.id.replace("answerOption-","")].setIsCorrect(false);
			}
			Session.set("questionGroup", questionItem);
			localData.addHashtag(Session.get("questionGroup"));
		},
		onInit: function (event) {
			const item = $('.bootstrap-switch-id-' + event.target.id);
			item.find("span").css({fontSize: "14px", "padding": "5px"});
			item.find(".bootstrap-switch-container").css({"width": "auto"});
		}
	});

	Session.get("questionGroup").getQuestionList()[EventManagerCollection.findOne().questionIndex].getAnswerOptionList().forEach(function (answerOption) {
		if (answerOption.getIsCorrect()) {
			const item = $('#answerOption-' + answerOption.getAnswerOptionNumber());
			item.bootstrapSwitch('state', 'true');
		}
	});
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
			'min': questionItem.getQuestionList()[index].getMinRange() - 50 < 0 ? 0 : questionItem.getQuestionList()[index].getMinRange() - 50,
			'max': questionItem.getQuestionList()[index].getMaxRange() + 50 || 100
		}
	});
	sliderObject.on('set', function (val) {
		const minRange = parseInt(val[0]);
		const maxRange = parseInt(val[1]);
		try {
			questionItem.getQuestionList()[index].setRange(minRange, maxRange);
			Session.set("questionGroup", questionItem);
			localData.addHashtag(questionItem);
			$('#minRangeInput, #maxRangeInput').removeClass("invalid");
		} catch (ex) {
			$('#minRangeInput, #maxRangeInput').addClass("invalid");
		}
	});
	sliderObject.on('slide', function () {
		const minRange = parseInt($('#minRangeInput').val());
		const maxRange = parseInt($('#maxRangeInput').val());
		sliderObject.updateOptions({
			margin: 1,
			range: {
				'min': [minRange - 50 < 0 ? 0 : minRange - 50],
				'max': [minRange > maxRange ? minRange + 50 : maxRange + 50]
			}
		});
	});
	$('#minRangeInput, #maxRangeInput').on("change", function () {
		const minRange = parseInt($('#minRangeInput').val());
		const maxRange = parseInt($('#maxRangeInput').val());
		if (typeof minRange !== "undefined" && typeof maxRange !== "undefined") {
			const newMaxRange = minRange > maxRange ? minRange + 50 : maxRange + 50;
			sliderObject.updateOptions({
				margin: 1,
				range: {
					'min': [minRange - 50 < 0 ? 0 : minRange - 50],
					'max': [newMaxRange]
				}
			});
			sliderObject.set([minRange, newMaxRange - 50]);
		}
	});
}

export function setSlider(index) {
	const questionItem = Session.get("questionGroup");
	$("#slider").val((questionItem.getQuestionList()[index].getTimer()));
}
