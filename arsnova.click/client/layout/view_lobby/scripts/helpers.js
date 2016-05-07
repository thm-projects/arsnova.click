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
import * as localData from '/client/lib/local_storage.js';
import {MemberListCollection} from '/lib/member_list/collection.js';

Template.memberlist.helpers({
	hashtag: function () {
		return Router.current().params.quizName;
	},
	isOwner: function () {
		return localData.containsHashtag(Router.current().params.quizName);
	},
	learners: function () {
		var sortParamObj = Session.get("learnerCountOverride") ? {lowerCaseNick: 1} : {insertDate: -1};
		return [
			MemberListCollection.find({nick: localStorage.getItem(Router.current().params.quizName + "nick")}, {
				limit: 1
			}),
			MemberListCollection.find({nick: {$ne: localStorage.getItem(Router.current().params.quizName + "nick")}}, {
				limit: (Session.get("learnerCount") - 1),
				sort: sortParamObj
			})
		];
	},
	showMoreButton: function () {
		return ((MemberListCollection.find().count() - Session.get("learnerCount")) > 1);
	},
	invisibleLearnerCount: function () {
		return MemberListCollection.find().count() - Session.get("learnerCount");
	},
	memberlistCount: function () {
		return MemberListCollection.find().count();
	}
});

Template.learner.helpers({
	isOwnNick: function (nickname) {
		return nickname === localStorage.getItem(Router.current().params.quizName + "nick");
	}
});
