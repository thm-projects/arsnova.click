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
import {AbstractQuestion} from "./question_abstract";

export const QuestionGroupCollection = new Mongo.Collection("questionGroup");
export const questionTextSchema = {
	type: String,
	optional: true,
	max: 10000
};
export const timerSchema = {
	type: Number,
	min: 0
};
export const startTimeSchema = {
	type: String,
	optional: true
};

export const questionGroupSchema = new SimpleSchema({
	hashtag: hashtagSchema,
	questionList: {
		/* The index is defined in the EventManager.questionIndex variable. The arrays index represents the questionIndex. */
		type: [AbstractQuestion]
	}/*,
	"questionList.$.questionText": {
		type: questionTextSchema,
		optional: true
	},
	"questionList.$.timer": {
		type: timerSchema
	},
	"questionList.$.startTime": {
		type: startTimeSchema,
		optional: true
	}*/
});

//QuestionGroupCollection.attachSchema(questionGroupSchema);

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
