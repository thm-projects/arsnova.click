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
import {Template} from 'meteor/templating';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {calculateHeaderSize} from '/client/layout/region_header/lib.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";
import {formatAnswerButtons, startCountdown} from './lib.js';

Template.votingview.onRendered(function () {
	if (QuestionGroupCollection.findOne().questionList[EventManagerCollection.findOne().questionIndex].type !== "RangedQuestion" &&
		QuestionGroupCollection.findOne().questionList[EventManagerCollection.findOne().questionIndex].answerOptionList[0].type !== "FreeTextAnswerOption") {
		$(window).resize(function () {
			Meteor.defer(formatAnswerButtons);
		});
		Meteor.defer(formatAnswerButtons);
	}

	footerElements.removeFooterElements();
	footerElements.calculateFooter();

	startCountdown(EventManagerCollection.findOne().questionIndex);
	calculateHeaderSize();
	$(window).resize(calculateHeaderSize);
});
