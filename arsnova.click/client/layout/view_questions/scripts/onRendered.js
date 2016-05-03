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
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import * as lib from './lib.js';

Template.createQuestionView.onRendered(function () {
	Session.set("markdownAlreadyChecked", false);
	lib.calculateWindow();
	$(window).resize(lib.calculateWindow());

	let index;
	lib.subscriptionHandler = Tracker.autorun(()=> {
		if (this.subscriptionsReady() && EventManagerCollection.findOne()) {
			index = EventManagerCollection.findOne().questionIndex;
			if (!Session.get("markdownAlreadyChecked")) {
				lib.checkForMarkdown();
				Session.set("markdownAlreadyChecked", true);
			}
		}
	});
	var body = $('body');
	body.on('click', '.questionIcon:not(.active)', function () {
		var currentSession = QuestionGroupCollection.findOne();
		if (!currentSession || index >= currentSession.questionList.length) {
			return;
		}

		lib.addQuestion(index);
	});
	body.on('click', '.removeQuestion', function () {
		index = EventManagerCollection.findOne().questionIndex;
	});
});
