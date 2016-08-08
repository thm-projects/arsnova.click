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
import {hashtagSchema} from '/lib/hashtags/collection.js';
import * as localData from '/lib/local_storage.js';

Template.hashtagManagement.helpers({
	serverHashtags: function () {
		return localData.getAllHashtags();
	},
	isLastItem: function (index) {
		return index === localData.getAllHashtags().length - 1;
	},
	noHashtagsAvailable: function () {
		return localData.getAllHashtags().length === undefined || localData.getAllHashtags().length === 0;
	}
});

Template.hashtagView.helpers($.extend({getHashtagSchema: hashtagSchema}, {
	isAddingDemoQuiz: function () {
		return Session.get("isAddingDemoQuiz");
	},
	isEditingQuiz: function () {
		return Session.get("isEditingQuiz");
	},
	hasDemoQuiz: function () {
		let hasDemoQuiz = false;
		$.each(localData.getAllHashtags(), function (index, item) {
			if (item.toLowerCase().indexOf("demo quiz") !== -1) {
				hasDemoQuiz = true;
				return false;
			}
		});
		return hasDemoQuiz;
	}
}));
