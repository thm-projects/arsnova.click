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
import {TAPi18n} from 'meteor/tap:i18n';
import {EventManager} from '/lib/eventmanager.js';
import {AnswerOptions} from '/lib/answeroptions.js';
import {countdown} from './lib.js';

Template.votingview.helpers({
	answerOptions: function () {
		return AnswerOptions.find({questionIndex: EventManager.findOne().questionIndex}, {sort: {answerOptionNumber: 1}});
	},
	showForwardButton: function () {
		return Session.get("hasToggledResponse") && !(Session.get("hasSendResponse"));
	},
	answerOptionLetter: function (number) {
		return String.fromCharCode((number.hash.number + 65));
	},
	getCountdown: function () {
		if (Session.get("countdownInitialized")) {
			return TAPi18n.__("view.voting.seconds_left", {value: countdown.get(), count: countdown.get()});
		}
	}
});
