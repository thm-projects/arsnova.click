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
import * as headerLib from '/client/layout/region_header/lib.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";
import * as lib from './lib.js';

Template.createAnswerOptions.onRendered(function () {
	footerElements.removeFooterElements();
	footerElements.addFooterElement(footerElements.footerElemHome);
	headerLib.calculateHeaderSize();
	headerLib.calculateTitelHeight();
});

Template.defaultAnswerOptionTemplate.onRendered(function () {
	if ($(window).width() >= 992) {
		$('#answerOptionText_Number0').focus();
	}
	lib.formatIsCorrectButtons();
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
});

Template.freeTextAnswerOptionTemplate.onRendered(function () {
	lib.formatFreeTextSettingsButtons();

	const questionItem = Session.get("questionGroup");
	lib.styleFreetextAnswerOptionValidation(questionItem.getQuestionList()[Router.current().params.questionIndex].getAnswerOptionList()[0].isValid());
});
