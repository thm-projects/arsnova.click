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
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {MemberListCollection} from '/lib/member_list/collection.js';
import {HashtagsCollection} from '/lib/hashtags/collection.js';

Meteor.methods({
	'MemberList.addLearner': function ({hashtag, nick, backgroundColor, foregroundColor}) {
		new SimpleSchema({
			hashtag: {type: String},
			nick: {type: String},
			backgroundColor: {type: String},
			foregroundColor: {type: String}
		}).validate({
			hashtag,
			nick,
			backgroundColor,
			foregroundColor
		});
		if (MemberListCollection.findOne({
				hashtag: hashtag,
				nick: nick
			})) {
			throw new Meteor.Error('MemberList.addLearner', 'Nick already exists!');
		}
		if (EventManagerCollection.findOne({hashtag: hashtag}).sessionStatus !== 2) {
			throw new Meteor.Error('MemberList.addLearner', 'plugins.splashscreen.error.error_messages.session_not_available');
		}
		MemberListCollection.insert({
			hashtag: hashtag,
			nick: nick,
			lowerCaseNick: nick.toLowerCase(),
			backgroundColor: backgroundColor,
			foregroundColor: foregroundColor,
			readConfirmed: [],
			insertDate: new Date().getTime()
		});
		EventManagerCollection.update({hashtag: hashtag}, {
			$push: {
				eventStack: {
					key: "MemberList.addLearner",
					value: {user: nick}
				}
			}
		});
	},
	'MemberList.removeLearner': function (privateKey, hashtag, nickId) {
		if (Meteor.isClient) {
			return;
		}

		new SimpleSchema({
			hashtag: {type: String},
			nickId: {type: String}
		}).validate({
			hashtag,
			nickId
		});

		if (!HashtagsCollection.findOne({
				privateKey: privateKey,
				hashtag: hashtag
			})) {
			throw new Meteor.Error('MemberList.removeLearner', 'plugins.splashscreen.error.error_messages.not_authorized');
		}

		let nickName = MemberListCollection.findOne({
			hashtag: hashtag,
			_id: nickId
		}).nick;

		if (nickName) {
			MemberListCollection.remove({
				hashtag: hashtag,
				_id: nickId
			}, function (err) {
				if (err) {
					throw new Meteor.Error('MemberList.removeLearner', 'plugins.splashscreen.error.error_messages.Internal Server Error');
				}
				EventManagerCollection.update({hashtag: hashtag}, {
					$push: {
						eventStack: {
							key: "MemberList.removeLearner",
							value: {user: nickName}
						}
					}
				});
			});
		}
	},
	'MemberList.setReadConfirmed': function ({hashtag, questionIndex, nick}) {
		/*
		 TODO Everybody can set "readConfirmed" for each user!
		 Maybe link this method to a privateKey for learners?
		 Maybe check with Meteor.user()?
		 */
		new SimpleSchema({
			hashtag: {type: String},
			questionIndex: {type: Number},
			nick: {type: String}
		}).validate({
			hashtag,
			questionIndex,
			nick
		});
		var member = MemberListCollection.findOne({
			hashtag: hashtag,
			nick: nick
		});
		if (!member) {
			throw new Meteor.Error('MemberList.setReadConfirmed', 'plugins.splashscreen.error.error_messages.member_not_found');
		}
		member.readConfirmed[questionIndex] = 1;
		MemberListCollection.update(member._id, {$set: {readConfirmed: member.readConfirmed}});
		EventManagerCollection.update({hashtag: hashtag}, {
			$push: {
				eventStack: {
					key: "MemberList.setReadConfirmed",
					value: {
						user: nick,
						questionIndex: questionIndex
					}
				}
			}
		});
	},
	'MemberList.clearReadConfirmed': function (privateKey, hashtag) {
		if (Meteor.isServer) {
			var doc = HashtagsCollection.findOne({
				hashtag: hashtag,
				privateKey: privateKey
			});
			if (doc) {
				MemberListCollection.update({hashtag: hashtag}, {$set: {readConfirmed: []}});
			} else {
				throw new Meteor.Error('MemberList.clearReadConfirmed', 'plugins.splashscreen.error.error_messages.not_authorized');
			}
		} else {
			MemberListCollection.update({hashtag: hashtag}, {$set: {readConfirmed: []}});
			EventManagerCollection.update({hashtag: hashtag}, {
				$push: {
					eventStack: {
						key: "MemberList.clearReadConfirmed",
						value: {}
					}
				}
			});
		}
	},
	'MemberList.removeFromSession': function (privateKey, hashtag) {
		if (Meteor.isServer) {
			var doc = HashtagsCollection.findOne({
				hashtag: hashtag,
				privateKey: privateKey
			});
			if (doc) {
				MemberListCollection.remove({hashtag: hashtag});
				EventManagerCollection.update({hashtag: hashtag}, {
					$push: {
						eventStack: {
							key: "MemberList.removeFromSession",
							value: {}
						}
					}
				});
			} else {
				throw new Meteor.Error('MemberList.removeFromSession', 'plugins.splashscreen.error.error_messages.not_authorized');
			}
		}
	}
});
