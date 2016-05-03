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
import {MemberListCollection} from '/lib/member_list/collection.js';

Template.memberlist.helpers({
	hashtag: function () {
		return Session.get("hashtag");
	},
	isOwner: function () {
		return Session.get("isOwner");
	},
	learners: function () {
		var sortParamObj = Session.get('LearnerCountOverride') ? {lowerCaseNick: 1} : {insertDate: -1};
		return [
			MemberListCollection.find({nick: Session.get("nick")}, {
				limit: 1
			}),
			MemberListCollection.find({nick: {$ne: Session.get("nick")}}, {
				limit: (Session.get("LearnerCount") - 1),
				sort: sortParamObj
			})
		];
	},
	showMoreButton: function () {
		return ((MemberListCollection.find().count() - Session.get("LearnerCount")) > 1);
	},
	invisibleLearnerCount: function () {
		return MemberListCollection.find().count() - Session.get("LearnerCount");
	},
	memberlistCount: function () {
		return MemberListCollection.find().count();
	}
});

Template.learner.helpers({
	isOwnNick: function (nickname) {
		return nickname === Session.get("nick");
	}
});
