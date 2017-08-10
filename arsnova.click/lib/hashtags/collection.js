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
import * as localData from '/lib/local_storage.js';

export const HashtagsCollection = new Mongo.Collection("hashtags");
export const hashtagSchema = {
	type: String,
	min: 1,
	max: 30
};
export const privateKeySchema = {
	type: String,
	min: 24,
	max: 24
};
export const hashtagsCollectionSchema = new SimpleSchema({
	hashtag: {
		type: hashtagSchema
	},
	privateKey: {
		type: privateKeySchema
	}
});

HashtagsCollection.attachSchema(hashtagsCollectionSchema);

HashtagsCollection.deny({
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

HashtagsCollection.allow({
	insert: function (userId, doc) {
		return doc.privateKey === localData.getPrivateKey();
	},
	remove: function (userId, doc) {
		return doc.privateKey === localData.getPrivateKey();
	}
});
