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
import * as localData from '/lib/local_storage.js';
import {MemberListCollection} from '/lib/member_list/collection.js';
import * as lib from './lib.js';

Template.memberlist.helpers({
	isOwner: function () {
		return localData.containsHashtag(Router.current().params.quizName);
	},
	hasPlayers: function () {
		return MemberListCollection.find().count() > 0;
	},
	learners: function () {
		const limit = localData.containsHashtag(Router.current().params.quizName) ? Session.get("maxLearnerButtons") : Session.get("maxLearnerButtons") - 1;
		const sortParamObj = Session.get("learnerCountOverride") ? {lowerCaseNick: 1} : {limit: limit, sort: {insertDate: -1}};
		const result = [
			MemberListCollection.find({nick: localStorage.getItem(Router.current().params.quizName + "nick")}, {
				limit: 1
			})
		];
		if (Session.get("maxLearnerButtons") > 0 || localData.containsHashtag(Router.current().params.quizName)) {
			result.push(
				MemberListCollection.find({nick: {$ne: localStorage.getItem(Router.current().params.quizName + "nick")}}, sortParamObj)
			);
		}
		return result;
	},
	memberlistCount: function () {
		return MemberListCollection.find().count();
	}
});

Template.learner.helpers({
	isOwner: function () {
		return localData.containsHashtag(Router.current().params.quizName);
	},
	isOwnNick: function (nickname) {
		return nickname === localStorage.getItem(Router.current().params.quizName + "nick");
	}
});

Template.memberlistTitel.helpers({
	isOwner: function () {
		return localData.containsHashtag(Router.current().params.quizName);
	},
	memberlistCount: function () {
		return MemberListCollection.find().count();
	}
});

Template.memberlistFooterNavButtons.helpers({
	hasTooMuchButtons: ()=> {
		return Session.get("learnerCountOverride") || (Session.get("allMembersCount") - Session.get("maxLearnerButtons") > 0);
	},
	invisibleLearnerCount: function () {
		return Session.get("allMembersCount") - Session.get("maxLearnerButtons");
	},
	hasOverridenDefaultButtonCount: function () {
		return Session.get("learnerCountOverride");
	},
	hasPlayers: function () {
		lib.memberlistTracker.changed();
		return MemberListCollection.find().count() > 0;
	},
	isOwner: function () {
		return localData.containsHashtag(Router.current().params.quizName);
	}
});
