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
import {HashtagsCollection} from '/lib/hashtags/collection.js';
import {buzzsound1, setBuzzsound1} from './lib.js';

Template.soundConfig.onRendered(function () {

	var hashtagDoc = HashtagsCollection.findOne({hashtag: Router.current().params.quizName});
	Session.set("slider2", hashtagDoc.musicVolume);
	setBuzzsound1(hashtagDoc.musicTitle);
	$('#soundSelect').val(hashtagDoc.musicTitle).select();

	if (hashtagDoc.musicEnabled) {
		$('#isSoundOnButton').toggleClass("down");
	}

	this.$("#slider2").noUiSlider({
		start: Session.get("slider2"),
		range: {
			'min': 0,
			'max': 100
		}
	}).on('slide', function (ev, val) {
		var musicVolume = Math.round(val);
		Session.set('slider2', musicVolume);
		buzzsound1.setVolume(musicVolume);
	}).on('change', function (ev, val) {
		var musicVolume = Math.round(val);
		Session.set('slider2', musicVolume);
		buzzsound1.setVolume(musicVolume);
	});
});
