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
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {calculateHeaderSize} from '/client/layout/region_header/lib.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";
import * as lib from './lib.js';

Template.createAnswerOptions.onRendered(function () {
	var body = $('body');
	body.on('click', '.questionIcon:not(.active)', function () {
		Router.go("/" + Router.current().params.quizName + "/question");
	});

	footerElements.removeFooterElements();
	footerElements.addFooterElement(footerElements.footerElemHome);
	footerElements.addFooterElement(footerElements.footerElemNicknames);
});

Template.defaultAnswerOptionTemplate.onRendered(function () {
	if ($(window).width() >= 992) {
		$('#answerOptionText_Number0').focus();
	}

	var inputFieldElements = document.getElementsByClassName("input-field");
	for (var i = inputFieldElements.length - 1; i >= 0; --i) {
		if ($(inputFieldElements[i]).val().length === 0) {
			$(inputFieldElements[i]).closest(".input-group").addClass("invalidAnswerOption");
		}
	}

	lib.formatIsCorrectButtons();
});

Template.rangedAnswerOptionTemplate.onRendered(function () {
	lib.createSlider(EventManagerCollection.findOne().questionIndex);
	const correctValueInputField = $('#correctValueInput');
	$.each(Session.get("questionGroup").getQuestionList()[EventManagerCollection.findOne().questionIndex].getValidationStackTrace(), function (index, element) {
		if (element.reason === "invalid_correct_value") {
			correctValueInputField.addClass("invalid");
			return false;
		}
	});
});

Template.freeTextAnswerOptionTemplate.onRendered(function () {
	lib.formatFreeTextSettingsButtons();
});
