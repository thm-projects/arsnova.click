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

export const EventManagerCollection = new Mongo.Collection("eventmanager");
export const sessionStatusSchema = new SimpleSchema({
	type: Number,
	min: 0,
	max: 3
});
export const lastConnectionSchema = new SimpleSchema({
	type: Number
});
export const readingConfirmationIndexSchema = new SimpleSchema({
	type: Number,
	min: -1,
	optional: true
});
export const questionIndexSchema = new SimpleSchema({
	type: Number,
	min: -1,
	optional: true
});
export const eventStackItemScheme = new SimpleSchema({
	key: {
		type: String
	},
	value: {
		type: Object,
		blackbox: true /* @see https://github.com/aldeed/meteor-simple-schema#blackbox */
	}
});
export const eventStackScheme = new SimpleSchema({
	type: [eventStackItemScheme]
});
export const eventManagerCollectionSchema = new SimpleSchema({
	hashtag: hashtagSchema,
	sessionStatus: sessionStatusSchema,
	lastConnection: lastConnectionSchema,
	readingConfirmationIndex: readingConfirmationIndexSchema,
	questionIndex: questionIndexSchema,
	eventStack: eventStackScheme
});

EventManagerCollection.attachSchema(eventManagerCollectionSchema);

EventManagerCollection.deny({
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

EventManagerCollection.allow({
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
