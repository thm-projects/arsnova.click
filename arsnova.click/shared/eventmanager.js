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

Meteor.methods({
	'EventManagerCollection.setSessionStatus': (hashtag, sessionStatus)=> {
		const query = {};
		if (Meteor.isServer) {
			query.hashtag = hashtag;
		}
		EventManagerCollection.update(query, {
			$set: {sessionStatus: sessionStatus},
			$push: {
				eventStack: {
					key: "EventManagerCollection.setSessionStatus",
					value: {sessionStatus: sessionStatus}
				}
			}
		});
	},
	'EventManagerCollection.showReadConfirmedForIndex': (hashtag, index)=> {
		EventManagerCollection.update({hashtag: hashtag}, {
			$set: {readingConfirmationIndex: index},
			$push: {
				eventStack: {
					key: "EventManagerCollection.showReadConfirmedForIndex",
					value: {readingConfirmationIndex: index}
				}
			}
		});
	},
	'EventManagerCollection.setActiveQuestion': (hashtag, index)=> {
		EventManagerCollection.update({hashtag: hashtag}, {
			$set: {
				questionIndex: index,
				readingConfirmationIndex: index
			},
			$push: {
				eventStack: {
					key: "EventManagerCollection.setActiveQuestion",
					value: {
						questionIndex: index,
						readingConfirmationIndex: index
					}
				}
			}
		});
	},
	'EventManagerCollection.clear': (hashtag) => {
		new SimpleSchema({
			hashtag: {type: String}
		}).validate({
			hashtag
		});
		EventManagerCollection.remove({hashtag: hashtag});
	},
	'EventManagerCollection.beforeClear': (hashtag) => {
		new SimpleSchema({
			hashtag: {type: String}
		}).validate({
			hashtag
		});
		EventManagerCollection.update({hashtag: hashtag}, {
			$push: {
				eventStack: {
					key: "EventManagerCollection.beforeClear",
					value: {}
				}
			}
		});
	},
	'EventManagerCollection.reset': (hashtag) => {
		EventManagerCollection.update({hashtag: hashtag}, {
			$set: {
				sessionStatus: 1,
				readingConfirmationIndex: -1,
				questionIndex: -1,
				eventStack: [
					{
						key: "EventManagerCollection.reset",
						value: {
							sessionStatus: 1,
							readingConfirmationIndex: -1,
							questionIndex: -1
						}
					}
				]
			}
		});
	},
	'EventManagerCollection.add': (hashtag) => {
		if (EventManagerCollection.findOne({hashtag: hashtag})) {
			throw new Meteor.Error('EventManagerCollection.add', 'hashtag_exists');
		}
		EventManagerCollection.insert({
			hashtag: hashtag,
			sessionStatus: 1,
			lastConnection: 0,
			readingConfirmationIndex: -1,
			questionIndex: 0,
			eventStack: [
				{
					key: "EventManagerCollection.add",
					value: {
						sessionStatus: 1,
						readingConfirmationIndex: -1,
						questionIndex: 0
					}
				}
			]
		});
	},
	'keepalive': function (hashtag) {
		new SimpleSchema({
			hashtag: {type: String}
		}).validate({
			hashtag
		});
		EventManagerCollection.update({hashtag: hashtag}, {$set: {lastConnection: (new Date()).getTime()}});
	}
});
