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
import {Tracker} from 'meteor/tracker';
import {TAPi18n} from 'meteor/tap:i18n';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {calculateHeaderSize} from '/client/layout/region_header/lib.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";
import * as localData from '/lib/local_storage.js';
import * as lib from './lib.js';

Template.createAnswerOptions.onRendered(function () {
	calculateHeaderSize();
	$(window).resize(calculateHeaderSize);

	let index;
	lib.subscriptionHandler = Tracker.autorun(()=> {
		if (!EventManagerCollection.findOne()) {
			return;
		}
		index = EventManagerCollection.findOne().questionIndex;
	});
	var body = $('body');
	body.on('click', '.questionIcon:not(.active)', function () {
		if (index >= Session.get("questionGroup").getQuestionList()[index].getAnswerOptionList().length) {
			return;
		}

		lib.parseAnswerOptionInput(index);
		Router.go("/" + Router.current().params.quizName + "/question");
	});
	body.on('click', '.removeQuestion', function () {
		index = EventManagerCollection.findOne().questionIndex;
	});

	if ($(window).width() >= 992) {
		$('#answerOptionText_Number0').focus();
	}

	var inputFieldElements = document.getElementsByClassName("input-field");
	for (var i = inputFieldElements.length - 1; i >= 0; --i) {
		if ($(inputFieldElements[i]).val().length === 0) {
			$(inputFieldElements[i]).closest(".input-group").addClass("invalidAnswerOption");
		}
	}

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
				item.find(".bootstrap-switch-container").css({width: "116px"});
				answerlist.getAnswerOptionList()[event.target.id.replace("answerOption-","")].setIsCorrect(true);
			} else {
				item.find('.bootstrap-switch-handle-off').removeClass("hiddenImportant");
				item.find(".bootstrap-switch-container").css({width: "174px"});
				answerlist.getAnswerOptionList()[event.target.id.replace("answerOption-","")].setIsCorrect(false);
			}
			Session.set("questionGroup", questionItem);
			localData.addHashtag(Session.get("questionGroup"));
		},
		onInit: function (event) {
			const item = $('.bootstrap-switch-id-' + event.target.id);
			item.find("span").css({fontSize: "14px", "padding": "5px"});
		}
	});

	Session.get("questionGroup").getQuestionList()[EventManagerCollection.findOne().questionIndex].getAnswerOptionList().forEach(function (answerOption) {
		if (answerOption.getIsCorrect()) {
			const item = $('#answerOption-' + answerOption.getAnswerOptionNumber());
			item.bootstrapSwitch('state', 'true');
		}
	});

	footerElements.removeFooterElements();
	footerElements.addFooterElement(footerElements.footerElemHome);
	footerElements.calculateFooter();
});
