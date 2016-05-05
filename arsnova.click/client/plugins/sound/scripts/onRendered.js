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
import {buzzsound1, setBuzzsound1} from './lib.js';

Template.soundConfig.onRendered(function () {
	setBuzzsound1('bensound-thelounge.mp3');
	localStorage.setItem(Router.current().params.quizName + "globalVolume", 80);

	this.$("#slider2").noUiSlider({
		start: localStorage.getItem(Router.current().params.quizName + "slider2"),
		range: {
			'min': 0,
			'max': 100
		}
	}).on('slide', function (ev, val) {
		localStorage.setItem(Router.current().params.quizName + 'slider2', Math.round(val));
		localStorage.setItem(Router.current().params.quizName + "globalVolume", Math.round(val));
		buzzsound1.setVolume(localStorage.getItem(Router.current().params.quizName + "globalVolume"));
	}).on('change', function (ev, val) {
		localStorage.setItem(Router.current().params.quizName + 'slider2', Math.round(val));
		localStorage.setItem(Router.current().params.quizName + "globalVolume", Math.round(val));
		buzzsound1.setVolume(localStorage.getItem(Router.current().params.quizName + "globalVolume"));
	});
});
