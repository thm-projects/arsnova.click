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

Template.createTimerView.helpers({
	slider: function () {
		if (!Session.get("questionGroup")) {
			return;
		}
		return Session.get("questionGroup").getQuestionList()[Router.current().params.questionIndex].getTimer();
	},
	getParsedSeconds: function () {
		if (!Session.get("questionGroup")) {
			return;
		}
		const date = new Date(null);
		date.setSeconds(Session.get("questionGroup").getQuestionList()[Router.current().params.questionIndex].getTimer());
		const formatted = date.toISOString().substr(11, 8).split(":");
		return {
			hours: parseInt(formatted[0]),
			minutes: parseInt(formatted[1]),
			seconds: parseInt(formatted[2])
		};
	}
});
