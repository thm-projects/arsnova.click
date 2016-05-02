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
import {EventManager} from '/lib/eventmanager.js';
import {QuestionGroup} from '/lib/questions.js';
import * as lib from './lib.js';

Template.createTimerView.onRendered(function () {
	lib.createSlider();

	let index;
	lib.subscriptionHandler = Tracker.autorun(()=> {
		if (this.subscriptionsReady()) {
			index = EventManager.findOne().questionIndex;
			lib.subscriptionHandler.stop();
			lib.setSlider(index);
		}
	});
	var body = $('body');
	body.on('click', '.questionIcon:not(.active)', function () {
		var currentSession = QuestionGroup.findOne();
		if (!currentSession || index >= currentSession.questionList.length) {
			return;
		}

		lib.setTimer(index);
		Router.go("/question");
	});
	body.on('click', '.removeQuestion', function () {
		index = EventManager.findOne().questionIndex;
	});

	lib.validationTrackerHandle = Tracker.autorun(()=> {
		var validQuestions = Session.get("validQuestions");
		var forwardButton = $('#forwardButton');
		forwardButton.removeAttr("disabled");
		for (var i = 0; i < validQuestions.length; i++) {
			if (!validQuestions[i]) {
				forwardButton.attr("disabled", "disabled");
			}
		}
	});
});
