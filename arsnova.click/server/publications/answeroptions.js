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
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AnswerOptionCollection} from '/lib/answeroptions/collection.js';
import {HashtagsCollection} from '/lib/hashtags/collection.js';

Meteor.publish('AnswerOptionCollection.instructor', function (pprivateKey, phashtag) {
	new SimpleSchema({
		phashtag: {type: String},
		pprivateKey: {type: String}
	}).validate({pprivateKey, phashtag});
	var doc = HashtagsCollection.find({
		hashtag: phashtag,
		privateKey: pprivateKey
	});
	return doc ? AnswerOptionCollection.find({hashtag: phashtag}) : false;
});

Meteor.publish('AnswerOptionCollection.options', function (phashtag) {
	new SimpleSchema({
		phashtag: {type: String}
	}).validate({phashtag});
	return AnswerOptionCollection.find({hashtag: phashtag});
});

Meteor.publish('AnswerOptionCollection.public', function (hashtag) {
	new SimpleSchema({
		hashtag: {type: String}
	}).validate({hashtag});
	return AnswerOptionCollection.find({hashtag: hashtag}, {
		fields: {
			isCorrect: 0
		}
	});
});
