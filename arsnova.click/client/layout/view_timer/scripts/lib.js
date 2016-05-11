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
import {Session} from 'meteor/session';
import {TAPi18n} from 'meteor/tap:i18n';
import {AnswerOptionCollection} from '/lib/answeroptions/collection.js';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import * as localData from '/lib/local_storage.js';

export let validationTrackerHandle = null;

export function setTimer(index, callback) {
	var hasError = false;
	// timer is given in seconds
	const timer = Session.get("slider") * 1000;
	if (!isNaN(timer)) {
		Meteor.call("Question.setTimer", {
			hashtag: Router.current().params.quizName,
			questionIndex: index,
			timer: timer
		}, (err) => {
			if (err) {
				hasError = err;
			} else {
				localData.addTimer(Router.current().params.quizName, index, timer);
			}
		});
	} else {
		hasError = {
			reason: "Timer is not a number"
		};
	}

	if (hasError) {
		new ErrorSplashscreen({
			autostart: true,
			errorMessage: TAPi18n.__("plugins.splashscreen.error.error_messages." + hasError.reason)
		});
	} else if (typeof callback === "function") {
		callback();
	}
}

export function createSlider(index) {
	if (typeof QuestionGroupCollection.findOne() === "undefined") {
		setTimeout(createSlider, 50);
		return;
	}
	if (QuestionGroupCollection.findOne().questionList[index].timer === 0) {
		Session.set("slider", AnswerOptionCollection.find({questionIndex: index}).count() * 10);
	}
	$("#slider").noUiSlider({
		start: QuestionGroupCollection.findOne().questionList[index].timer / 1000,
		range: {
			'min': 6,
			'max': 260
		}
	}).on('slide', function (ev, val) {
		Session.set("slider", Math.round(val));
	}).on('change', function (ev, val) {
		Session.set("slider", Math.round(val));
	});
}

export function setSlider(index) {
	Session.set("slider", (QuestionGroupCollection.findOne().questionList[index].timer / 1000));
	$("#slider").val((QuestionGroupCollection.findOne().questionList[index].timer / 1000));
}
