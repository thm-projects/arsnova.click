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

import {Template} from 'meteor/templating';
import {HashtagsCollection} from "/lib/hashtags/collection.js";
import {NicknameCategoriesCollection} from "/lib/nickname_categories/collection.js";
import {MemberListCollection, userNickSchema} from "/lib/member_list/collection.js";

Template.nickViewWrapper.helpers({
	getRequiredNickView: function () {
		const selectedNicks = HashtagsCollection.findOne({hashtag: Router.current().params.quizName}, {fields: {selectedNicks: 1}}).selectedNicks;
		if (selectedNicks.length === 0) {
			return Template.nick;
		} else {
			return Template.nickLimited;
		}
	}
});

Template.nick.helpers({
	getUserNickSchema: function () {
		return userNickSchema;
	}
});

Template.nickLimited.helpers({
	getSelectableNicks: function () {
		return names = NicknameCategoriesCollection.find({
			_id: {
				$in: HashtagsCollection.findOne({hashtag: Router.current().params.quizName}, {fields: {selectedNicks: 1}}).selectedNicks
			}
		}, {
			sort: {
				nick: 1
			}
		}).fetch().filter(function (item) {
			return !MemberListCollection.findOne({hashtag: Router.current().params.quizName, nick: item.nick});
		});
	}
});
