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
import {noUiSlider} from 'meteor/arsnova.click:nouislider';
import * as localData from '/lib/local_storage.js';

let sliderObject = null;
export function createSlider(index) {
	const questionItem = Session.get("questionGroup");
	if (questionItem.getQuestionList()[index].getTimer() === 0) {
		questionItem.getQuestionList()[index].setTimer(questionItem.getQuestionList()[index].getAnswerOptionList().length * 10);
		Session.set("questionGroup", questionItem);
		localData.addHashtag(Session.get("questionGroup"));
	}
	const plainSlider = document.getElementById('slider');
	sliderObject = noUiSlider.create(plainSlider, {
		step: 1,
		margin: 1,
		start: questionItem.getQuestionList()[index].getTimer(),
		range: {
			'min': 1,
			'max': questionItem.getQuestionList()[index].getTimer() + 50 || 100
		}
	});
	sliderObject.on('slide', function (val) {
		questionItem.getQuestionList()[index].setTimer(Math.round(val));
		sliderObject.updateOptions({
			margin: 1,
			range: {
				'min': 1,
				'max': questionItem.getQuestionList()[index].getTimer() + 50 || 100
			}
		});
		Session.set("questionGroup", questionItem);
		localData.addHashtag(Session.get("questionGroup"));
	});
}

export function setSlider(index) {
	const questionItem = Session.get("questionGroup");
	sliderObject.updateOptions({
		margin: 1,
		range: {
			'min': 1,
			'max': questionItem.getQuestionList()[index].getTimer() + 50 || 100
		}
	});
	sliderObject.set(questionItem.getQuestionList()[index].getTimer());
}
