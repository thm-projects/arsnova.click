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
import {AnswerOptionCollection} from '/lib/answeroptions/collection.js';

Template.createAnswerOptions.helpers({
	answerOptions: function () {
		return EventManagerCollection.findOne() ? AnswerOptionCollection.find({questionIndex: EventManagerCollection.findOne().questionIndex}, {sort: {answerOptionNumber: 1}}) : false;
	},
	answerOptionLetter: function (Nr) {
		return String.fromCharCode(Nr + 65);
	},
	showDeleteButtonOnStart: function () {
		return EventManagerCollection.findOne() && (AnswerOptionCollection.find({questionIndex: EventManagerCollection.findOne().questionIndex}).count() === 1) ? "hide" : "";
	}
});
