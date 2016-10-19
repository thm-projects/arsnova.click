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

import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import {NicknameCategoriesCollection} from '/lib/nickname_categories/collection.js';

Template.nicknameCategories.helpers({
	nickNameCategories: function () {
		return _.uniq(NicknameCategoriesCollection.find({}, {
			sort: {nickCategory: 1}
		}).fetch().map(function (x) {
			return x.nickCategory;
		}), true);
	},
	nickNames: function () {
		if (!Session.get("selectedCategory") || Session.get("selectedCategory") === "undefined") {
			return false;
		}
		return NicknameCategoriesCollection.find({nickCategory: Session.get("selectedCategory")}, {sort: {nick: 1}, fields: {nick: 1}});
	},
	isSelectedNick: function (nick) {
		return Session.get("questionGroup").getConfiguration().getNickSettings().getSelectedValues().indexOf(NicknameCategoriesCollection.findOne({nick: nick}).nick) !== -1;
	},
	chosenNickNames: function () {
		return NicknameCategoriesCollection.find({'nick': {$in: Session.get("questionGroup").getConfiguration().getNickSettings().getSelectedValues()}}, {sort: {nick: 1}});
	},
	hasSelectedAll: function () {
		if (!Session.get("selectedCategory")) {
			return;
		}
		let hasAll = true;
		$.each(NicknameCategoriesCollection.find({nickCategory: Session.get("selectedCategory")}).fetch(), function (index, item) {
			if (Session.get("questionGroup").getConfiguration().getNickSettings().getSelectedValues().indexOf(item.nick) === -1) {
				hasAll = false;
				return false;
			}
		});
		return hasAll;
	},
	hasCASConfig: function () {
		return !!Meteor.settings.public && !!Meteor.settings.public.cas;
	}
});
