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
import * as lib from './lib.js';

Template.createQuestionView.helpers({
	//Get question from Sessions-Collection if it already exists
	questionText: function () {
		if (!EventManagerCollection.findOne() || !Session.get("questionGroup")) {
			return;
		}
		return Session.get("questionGroup").getQuestionList()[EventManagerCollection.findOne().questionIndex].getQuestionText();
	},
	isLargeWindow: function () {
		return $(window).height() > 699;
	},
	questionTypes: function () {
		if (!EventManagerCollection.findOne()) {
			return;
		}
		return lib.getQuestionTypes();
	}
});
