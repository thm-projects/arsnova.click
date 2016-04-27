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
import {AnswerOptions} from '/lib/answeroptions.js';
import {QuestionGroup} from '/lib/questions.js';
import * as localData from '/client/lib/local_storage.js';

export let validationTrackerHandle = null;
export let subscriptionHandler = null;

export function setTimer(index) {
	var hasError = false;
	// timer is given in seconds
	const timer = Session.get("slider") * 1000;
	if (!isNaN(timer)) {
		Meteor.call("Question.setTimer", {
			privateKey: localData.getPrivateKey(),
			hashtag: Session.get("hashtag"),
			questionIndex: index,
			timer: timer
		}, (err) => {
			if (err) {
				hasError = err;
			} else {
				localData.addTimer(Session.get("hashtag"), index, timer);
			}
		});
	} else {
		hasError = {
			reason: "Timer is not a number"
		};
	}
	return hasError;
}

export function createSlider(index) {
	if (Session.get("slider") === undefined) {
		setTimeout(createSlider, 50);
		return;
	}
	if (Session.get("slider") === 0) {
		Session.set("slider", AnswerOptions.find({questionIndex: index}).count() * 10);
	}
	$("#slider").noUiSlider({
		start: Session.get("slider"),
		range: {
			'min': 6,
			'max': 260
		}
	}).on('slide', function (ev, val) {
		Session.set('slider', Math.round(val));
	}).on('change', function (ev, val) {
		Session.set('slider', Math.round(val));
	});
}

export function setSlider(index) {
	Session.set('slider', (QuestionGroup.findOne().questionList[index].timer / 1000));
	$("#slider").val((QuestionGroup.findOne().questionList[index].timer / 1000));
}
