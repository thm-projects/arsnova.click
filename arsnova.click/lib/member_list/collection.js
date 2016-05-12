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

export const MemberListCollection = new Mongo.Collection("memberlist");
export const userNickSchema = {
	type: String,
	min: 3,
	max: 25
};
export const lowerCaseNickSchema = {
	type: String,
	min: 3,
	max: 25
};
export const userNickIdSchema = {
	type: String
};
export const readConfirmedSchema = {
	type: [Number]
};
export const backgroundColorSchema = {
	type: String,
	min: 7,
	max: 7
};
export const foregroundColorSchema = {
	type: String,
	min: 7,
	max: 7
};
export const insertDateSchema = {
	type: String
};
export const memberListCollectionSchema = new SimpleSchema({
	hashtag: hashtagSchema,
	nick: userNickSchema,
	lowerCaseNick: lowerCaseNickSchema,
	readConfirmed: readConfirmedSchema,
	backgroundColor: backgroundColorSchema,
	foregroundColor: foregroundColorSchema,
	insertDate: insertDateSchema
});

MemberListCollection.attachSchema(memberListCollectionSchema);

MemberListCollection.deny({
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

MemberListCollection.allow({
	insert: function (userId, doc) {
		const isOwner = localData.containsHashtag(doc.hashtag);
		const isOwnNick = doc.nick === localStorage.getItem(doc.hashtag + "nick");
		return isOwner || isOwnNick;
	},
	update: function (userId, doc) {
		const isOwner = localData.containsHashtag(doc.hashtag);
		const isOwnNick = doc.nick === localStorage.getItem(doc.hashtag + "nick");
		return isOwner || isOwnNick;
	},
	remove: function (userId, doc) {
		const isOwner = localData.containsHashtag(doc.hashtag);
		const isOwnNick = doc.nick === localStorage.getItem(doc.hashtag + "nick");
		return isOwner || isOwnNick;
	}
});
