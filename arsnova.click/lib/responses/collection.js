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
import SimpleSchema from 'simpl-schema';
import {hashtagSchema} from '../hashtags/collection.js';
import {questionIndexSchema} from '../eventmanager/collection.js';
import {userNickSchema, userRefSchema} from '../member_list/collection.js';
import {answerOptionNumberSchema} from '../answeroptions/collection.js';
import * as localData from '/lib/local_storage.js';

export const ResponsesCollection = new Mongo.Collection("responses");
export const responseTimeSchema = {
	type: Number,
	min: 0
};
export const rangedInputValueSchema = {
	type: Number,
	decimal: true,
	min: 0
};
export const freeTextInputValueSchema = {
	type: String
};
export const confidenceValueSchema = {
	type: Number,
	min: -1
};
export const responsesCollectionSchema = new SimpleSchema({
	hashtag: {
		type: hashtagSchema
	},
	questionIndex: {
		type: questionIndexSchema
	},
	userNick: {
		type: userNickSchema
	},
	answerOptionNumber: {
		type: Array, // [answerOptionNumberSchema],
		optional: true
	},
	"answerOptionNumber.$": {
		type: answerOptionNumberSchema
	},
	rangedInputValue: {
		type: rangedInputValueSchema,
		optional: true
	},
	freeTextInputValue: {
		type: freeTextInputValueSchema,
		optional: true
	},
	responseTime: {
		type: responseTimeSchema
	},
	confidenceValue: {
		type: confidenceValueSchema
	},
	userRef: {
		type: userRefSchema,
		optional: true
	},
	profile: {
		type: String,
		optional: true
	}
});

ResponsesCollection.attachSchema(responsesCollectionSchema);

ResponsesCollection.deny({
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

ResponsesCollection.allow({
	insert: function (userId, doc) {
		const isOwner = localData.containsHashtag(doc.hashtag);
		const isOwnNick = doc.userNick === sessionStorage.getItem(doc.hashtag + "nick");
		return isOwner || isOwnNick;
	},
	update: function (userId, doc) {
		return localData.containsHashtag(doc.hashtag);
	},
	remove: function (userId, doc) {
		return localData.containsHashtag(doc.hashtag);
	}
});
