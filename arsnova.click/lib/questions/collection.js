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

import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {hashtagSchema} from '../hashtags/collection.js';
import * as localData from '/lib/local_storage.js';

export const QuestionGroupCollection = new Mongo.Collection("questionGroup");
export const questionTextSchema = new SimpleSchema({
	type: String,
	optional: true,
	max: 10000
});
export const timerSchema = new SimpleSchema({
	type: Number,
	min: 0
});
export const startTimeSchema = new SimpleSchema({
	type: String,
	optional: true
});
export const singleQuestionSchema = new SimpleSchema({
	questionText: questionTextSchema,
	timer: timerSchema,
	startTime: startTimeSchema
});
export const questionListSchema = new SimpleSchema({
	type: [singleQuestionSchema] /* The index is defined in the EventManager.questionIndex variable. The arrays index represents the questionIndex. */
});

export const questionGroupSchema = new SimpleSchema({
	hashtag: hashtagSchema,
	questionList: questionListSchema
});

QuestionGroupCollection.attachSchema(questionGroupSchema);

QuestionGroupCollection.deny({
	insert: function () {
		return true;
	},
	update: function () {
		return true;
	},
	remove: function () {
		return true;
	}
});

QuestionGroupCollection.allow({
	insert: function (userId, doc) {
		return localData.containsHashtag(doc.hashtag);
	},
	update: function (userId, doc) {
		return localData.containsHashtag(doc.hashtag);
	},
	remove: function (userId, doc) {
		return localData.containsHashtag(doc.hashtag);
	}
});
