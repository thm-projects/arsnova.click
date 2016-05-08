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
import {HashtagsCollection} from '/lib/hashtags/collection.js';

Meteor.methods({
	'EventManagerCollection.setSessionStatus': (privateKey, hashtag, sessionStatus)=> {
		if (Meteor.isClient) {
			return;
		}

		new SimpleSchema({
			privateKey: {type: String},
			hashtag: {type: String},
			sessionStatus: {type: Number}
		}).validate({
			privateKey,
			hashtag,
			sessionStatus
		});

		if (!HashtagsCollection.findOne({
				hashtag: hashtag,
				privateKey: privateKey
			})) {
			throw new Meteor.Error('EventManagerCollection.setSessionStatus', 'not_authorized');
		}

		EventManagerCollection.update({hashtag: hashtag}, {
			$set: {sessionStatus: sessionStatus},
			$push: {
				eventStack: {
					key: "EventManagerCollection.setSessionStatus",
					value: {sessionStatus: sessionStatus}
				}
			}
		});
	},
	'EventManagerCollection.showReadConfirmedForIndex': (privateKey, hashtag, index)=> {
		if (Meteor.isClient) {
			return;
		}

		new SimpleSchema({
			privateKey: {type: String},
			hashtag: {type: String},
			index: {type: Number}
		}).validate({
			privateKey,
			hashtag,
			index
		});

		if (!HashtagsCollection.findOne({
				hashtag: hashtag,
				privateKey: privateKey
			})) {
			throw new Meteor.Error('EventManagerCollection.showReadConfirmedForIndex', 'not_authorized');
		}

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
	'EventManagerCollection.setActiveQuestion': (privateKey, hashtag, index)=> {
		if (Meteor.isClient) {
			return;
		}

		new SimpleSchema({
			privateKey: {type: String},
			hashtag: {type: String},
			index: {type: Number}
		}).validate({
			privateKey,
			hashtag,
			index
		});

		if (!HashtagsCollection.findOne({
				hashtag: hashtag,
				privateKey: privateKey
			})) {
			throw new Meteor.Error('EventManagerCollection.setActiveQuestion', 'not_authorized');
		}

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
	'EventManagerCollection.clear': (privateKey, hashtag) => {
		if (Meteor.isClient) {
			return;
		}

		new SimpleSchema({
			privateKey: {type: String},
			hashtag: {type: String}
		}).validate({
			privateKey,
			hashtag
		});

		if (!HashtagsCollection.findOne({
				hashtag: hashtag,
				privateKey: privateKey
			})) {
			throw new Meteor.Error('EventManagerCollection.clear', 'not_authorized');
		}

		EventManagerCollection.remove({hashtag: hashtag});
	},
	'EventManagerCollection.reset': (privateKey, hashtag) => {
		if (Meteor.isClient) {
			return;
		}

		new SimpleSchema({
			privateKey: {type: String},
			hashtag: {type: String}
		}).validate({
			privateKey,
			hashtag
		});

		if (!HashtagsCollection.findOne({
				hashtag: hashtag,
				privateKey: privateKey
			})) {
			throw new Meteor.Error('EventManagerCollection.reset', 'not_authorized');
		}

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
	'EventManagerCollection.add': (privateKey, hashtag) => {
		if (Meteor.isClient) {
			return;
		}

		new SimpleSchema({
			privateKey: {type: String},
			hashtag: {type: String}
		}).validate({
			privateKey,
			hashtag
		});

		if (!HashtagsCollection.findOne({
				hashtag: hashtag,
				privateKey: privateKey
			})) {
			throw new Meteor.Error('EventManagerCollection.add', 'not_authorized');
		}

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
	'keepalive': function (privateKey, hashtag) {
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
				EventManagerCollection.update({hashtag: hashtag}, {$set: {lastConnection: (new Date()).getTime()}});
			}
		}
	}
});
