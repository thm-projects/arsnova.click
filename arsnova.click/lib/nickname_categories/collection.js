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
import {userNickSchema} from '../member_list/collection.js';

export const NicknameCategoriesCollection = new Mongo.Collection("nicknameCategories");
export const nickCategorySchema = {
	type: String
};
export const insertDateSchema = {
	type: Date
};
export const lastUsedDateSchema = {
	type: Date
};
export const nicknameCategoriesCollectionSchema = new SimpleSchema({
	nick: userNickSchema,
	nickCategory: nickCategorySchema,
	insertDate: insertDateSchema,
	lastUsedDate: lastUsedDateSchema
});

NicknameCategoriesCollection.attachSchema(nicknameCategoriesCollectionSchema);

NicknameCategoriesCollection.deny({
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

NicknameCategoriesCollection.allow({
	insert: function () {
		return false;
	},
	update: function () {
		return false;
	},
	remove: function () {
		return false;
	}
});
