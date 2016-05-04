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
import {AnswerOptionCollection} from '/lib/answeroptions/collection.js';
import {MemberListCollection} from '/lib/member_list/collection.js';
import {ResponsesCollection} from '/lib/responses/collection.js';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {HashtagsCollection} from '/lib/hashtags/collection.js';

Meteor.methods({
	'Main.killAll': function (privateKey, hashtag) {
		if (Meteor.isServer) {
			new SimpleSchema({
				hashtag: {type: String},
				privateKey: {type: String}
			}).validate({
				privateKey,
				hashtag
			});
			var doc = HashtagsCollection.findOne({
				hashtag: hashtag,
				privateKey: privateKey
			});
			if (doc) {
				Meteor.call('EventManagerCollection.reset', privateKey, doc.hashtag, function () {
					AnswerOptionCollection.remove({hashtag: doc.hashtag});
					MemberListCollection.remove({hashtag: doc.hashtag});
					ResponsesCollection.remove({hashtag: doc.hashtag});
					QuestionGroupCollection.remove({hashtag: doc.hashtag});
				});
			}
		}
	},
	'Main.deleteEverything': function ({privateKey, hashtag}) {
		if (Meteor.isServer) {
			var hashtagDoc = HashtagsCollection.findOne({
				hashtag: hashtag,
				privateKey: privateKey
			});
			if (typeof hashtagDoc === "undefined") {
				throw new Meteor.Error('Main.deleteEverything', 'plugins.splashscreen.error.error_messages.not_authorized');
			}
			HashtagsCollection.remove({hashtag: hashtag});
			AnswerOptionCollection.remove({hashtag: hashtag});
			MemberListCollection.remove({hashtag: hashtag});
			ResponsesCollection.remove({hashtag: hashtag});
			QuestionGroupCollection.remove({hashtag: hashtag});
			EventManagerCollection.remove({hashtag: hashtag});
		}
	}
});
