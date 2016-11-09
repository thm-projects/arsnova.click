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
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import * as headerLib from '/client/layout/region_header/lib.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";
import * as lib from './lib.js';

Template.createQuestionView.onRendered(function () {
	let index;
	this.autorun(function () {
		if (!EventManagerCollection.findOne()) {
			return;
		}
		index = EventManagerCollection.findOne().questionIndex;
	}.bind(this));
	var body = $('body');
	body.on('click', '.questionIcon:not(.active)', function () {
		var currentSession = QuestionGroupCollection.findOne();
		if (!currentSession || index >= currentSession.questionList.length) {
			return;
		}

		lib.addQuestion(index);
		lib.checkForValidQuestionText();
	});
	body.on('click', '.removeQuestion', function () {
		index = EventManagerCollection.findOne().questionIndex;
		lib.checkForValidQuestionText();
	});

	lib.checkForValidQuestionText();

	footerElements.removeFooterElements();
	footerElements.addFooterElement(footerElements.footerElemHome);
	footerElements.addFooterElement(footerElements.footerElemNicknames);
	headerLib.calculateHeaderSize();
	headerLib.calculateTitelHeight();
});
