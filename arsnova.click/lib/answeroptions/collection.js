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
import {questionIndexSchema} from '../eventmanager/collection.js';
import * as localData from '/lib/local_storage.js';

export const AnswerOptionCollection = new Mongo.Collection("answeroptions");
export const answerTextSchema = {
	type: String,
	min: 0,
	max: 500,
	optional: true
};
export const answerOptionNumberSchema = {
	type: Number,
	min: 0
};
export const isCorrectSchema = {
	type: Number,
	min: 0,
	max: 1
};
export const answerOptionsCollectionSchema = new SimpleSchema({
	hashtag: {
		type: hashtagSchema
	},
	questionIndex: {
		type: questionIndexSchema
	},
	answerText: {
		type: answerTextSchema
	},
	answerOptionNumber: {
		type: answerOptionNumberSchema
	},
	isCorrect: {
		type: isCorrectSchema
	}
});

AnswerOptionCollection.attachSchema(answerOptionsCollectionSchema);

AnswerOptionCollection.deny({
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

AnswerOptionCollection.allow({
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
