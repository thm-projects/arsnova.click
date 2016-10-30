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
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {EventManagerCollection, questionIndexSchema} from '/lib/eventmanager/collection.js';
import {hashtagSchema, privateKeySchema} from '/lib/hashtags/collection.js';
import {MemberListCollection, userNickSchema, backgroundColorSchema, foregroundColorSchema, userNickIdSchema, userRefSchema} from '/lib/member_list/collection.js';

Meteor.methods({
	'MemberListCollection.addLearner': function ({hashtag, nick, privateKey, backgroundColor, foregroundColor, userRef}) {
		new SimpleSchema({
			hashtag: hashtagSchema,
			nick: userNickSchema,
			privateKey: privateKeySchema,
			backgroundColor: backgroundColorSchema,
			foregroundColor: foregroundColorSchema
		}).validate({hashtag, nick, privateKey, backgroundColor, foregroundColor});

		if (MemberListCollection.findOne({
				hashtag: hashtag,
				$or: [
					{nick: nick},
					{userRef: userRef}
				]
			})) {
			throw new Meteor.Error('MemberListCollection.addLearner', 'nick_already_exists');
		}
		const query = {};
		if (Meteor.isServer) {
			query.hashtag = hashtag;
		}
		if (EventManagerCollection.findOne(query).sessionStatus !== 2) {
			throw new Meteor.Error('MemberListCollection.addLearner', 'session_not_available');
		}
		MemberListCollection.insert({
			hashtag: hashtag,
			nick: nick,
			userRef: userRef,
			privateKey: privateKey,
			lowerCaseNick: nick.toLowerCase(),
			backgroundColor: backgroundColor,
			foregroundColor: foregroundColor,
			readConfirmed: [],
			insertDate: new Date().getTime()
		});
		EventManagerCollection.update(query, {
			$push: {
				eventStack: {
					key: "MemberListCollection.addLearner",
					value: {user: nick}
				}
			}
		});
	},
	'MemberListCollection.removeLearner': function (hashtag, nickId) {
		new SimpleSchema({
			hashtag: hashtagSchema,
			nickId: userNickIdSchema
		}).validate({hashtag, nickId});

		let nickName = MemberListCollection.findOne({
			hashtag: hashtag,
			_id: nickId
		}).nick;

		if (nickName) {
			MemberListCollection.remove({
				hashtag: hashtag,
				_id: nickId
			});
			EventManagerCollection.update({hashtag: hashtag}, {
				$push: {
					eventStack: {
						key: "MemberListCollection.removeLearner",
						value: {user: nickName}
					}
				}
			});
		}
	},
	"MemberListCollection.setLearnerReference": function ({hashtag, nick, userRef}) {
		new SimpleSchema({
			hashtag: hashtagSchema,
			nick: userNickSchema,
			userRef: userRefSchema
		}).validate({hashtag, nick, userRef});
		if (MemberListCollection.findOne({
				hashtag: hashtag,
				userRef: userRef
			})) {
			throw new Meteor.Error('MemberListCollection.setLearnerReference', 'nick_already_exists');
		}
		var member = MemberListCollection.findOne({
			hashtag: hashtag,
			nick: nick
		});
		if (!member) {
			throw new Meteor.Error('MemberListCollection.setLearnerReference', 'member_not_found');
		}
		MemberListCollection.update(member._id, {$set: {userRef: userRef}});
		EventManagerCollection.update({hashtag: hashtag}, {
			$push: {
				eventStack: {
					key: "MemberListCollection.setLearnerReference",
					value: {
						user: nick,
						userRef: userRef
					}
				}
			}
		});
	},
	'MemberListCollection.setReadConfirmed': function ({hashtag, questionIndex, nick}) {
		new SimpleSchema({
			hashtag: hashtagSchema,
			questionIndex: questionIndexSchema,
			nick: userNickSchema
		}).validate({hashtag, questionIndex, nick});

		var member = MemberListCollection.findOne({
			hashtag: hashtag,
			nick: nick
		});
		if (!member) {
			throw new Meteor.Error('MemberListCollection.setReadConfirmed', 'member_not_found');
		}
		member.readConfirmed[questionIndex] = 1;
		MemberListCollection.update(member._id, {$set: {readConfirmed: member.readConfirmed}});
		EventManagerCollection.update({hashtag: hashtag}, {
			$push: {
				eventStack: {
					key: "MemberListCollection.setReadConfirmed",
					value: {
						user: nick,
						questionIndex: questionIndex
					}
				}
			}
		});
	},
	'MemberListCollection.clearReadConfirmed': function (hashtag) {
		new SimpleSchema({hashtag: hashtagSchema}).validate({hashtag});

		MemberListCollection.update({hashtag: hashtag}, {$set: {readConfirmed: []}}, {multi: true});
		EventManagerCollection.update({hashtag: hashtag}, {
			$push: {
				eventStack: {
					key: "MemberListCollection.clearReadConfirmed",
					value: {}
				}
			}
		});
	},
	'MemberListCollection.removeFromSession': function (hashtag) {
		new SimpleSchema({hashtag: hashtagSchema}).validate({hashtag});

		MemberListCollection.remove({hashtag: hashtag});
		EventManagerCollection.update({hashtag: hashtag}, {
			$push: {
				eventStack: {
					key: "MemberListCollection.removeFromSession",
					value: {}
				}
			}
		});
	},
	"MemberListCollection.getCASUsers": function (hashtag) {
		new SimpleSchema({hashtag: hashtagSchema}).validate({hashtag});

		const result = MemberListCollection.find({hashtag: hashtag}).fetch();
		result.forEach(function (item) {
			const user = Meteor.users.findOne({_id: item.userRef});
			delete user._id;
			item.userRef = user;
		});

		return result;
	}
});
