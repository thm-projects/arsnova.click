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

import {Template} from 'meteor/templating';
import {Tracker} from 'meteor/tracker';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import * as lib from './lib.js';

Template.createAnswerOptions.onRendered(function () {
	var calculateHeight = function calculateHeight() {
		var answerOptionsHeight = $(".container").height() - $(".row-landingpage-buttons").outerHeight(true) - $(".titel-relative").outerHeight(true);
		$('.answer-options').css("height", answerOptionsHeight);
	};
	$(window).resize(calculateHeight);
	calculateHeight();

	let index;
	lib.subscriptionHandler = Tracker.autorun(()=> {
		if (this.subscriptionsReady()) {
			index = EventManagerCollection.findOne().questionIndex;
		}
	});
	var body = $('body');
	body.on('click', '.questionIcon:not(.active)', function () {
		var currentSession = QuestionGroupCollection.findOne();
		if (!currentSession || index >= currentSession.questionList.length) {
			return;
		}

		lib.parseAnswerOptionInput(index);
		Router.go("/question");
	});
	body.on('click', '.removeQuestion', function () {
		index = EventManagerCollection.findOne().questionIndex;
	});

	if ($(window).width() >= 992) {
		$('#answerOptionText_Number0').focus();
	}
});
