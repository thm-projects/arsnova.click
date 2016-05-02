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
import {EventManager} from '/lib/eventmanager.js';
import {Hashtags} from '/lib/hashtags.js';

Meteor.methods({
	'EventManager.setSessionStatus': (privateKey, hashtag, sessionStatus)=> {
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

		if (!Hashtags.findOne({
				hashtag: hashtag,
				privateKey: privateKey
			})) {
			throw new Meteor.Error('EventManager.setSessionStatus', 'plugins.splashscreen.error.error_messages.not_authorized');
		}

		EventManager.update({hashtag: hashtag}, {$set: {sessionStatus: sessionStatus}, $push: {eventStack: {key: "EventManager.setSessionStatus", value: {sessionStatus: sessionStatus}}}});
	},
	'EventManager.showReadConfirmedForIndex': (privateKey, hashtag, index)=> {
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

		if (!Hashtags.findOne({
				hashtag: hashtag,
				privateKey: privateKey
			})) {
			throw new Meteor.Error('EventManager.showReadConfirmedForIndex', 'plugins.splashscreen.error.error_messages.not_authorized');
		}

		EventManager.update({hashtag: hashtag}, {$set: {readingConfirmationIndex: index}, $push: {eventStack: {key: "EventManager.showReadConfirmedForIndex", value: {readingConfirmationIndex: index}}}});
	},
	'EventManager.setActiveQuestion': (privateKey, hashtag, index)=> {
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

		if (!Hashtags.findOne({
				hashtag: hashtag,
				privateKey: privateKey
			})) {
			throw new Meteor.Error('EventManager.setActiveQuestion', 'plugins.splashscreen.error.error_messages.not_authorized');
		}

		EventManager.update({hashtag: hashtag}, {$set: {questionIndex: index, readingConfirmationIndex: index}, $push: {eventStack: {key: "EventManager.setActiveQuestion", value: {questionIndex: index, readingConfirmationIndex: index}}}});
	},
	'EventManager.clear': (privateKey, hashtag) => {
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

		if (!Hashtags.findOne({
				hashtag: hashtag,
				privateKey: privateKey
			})) {
			throw new Meteor.Error('EventManager.clear', 'plugins.splashscreen.error.error_messages.not_authorized');
		}

		EventManager.remove({hashtag: hashtag});
	},
	'EventManager.reset': (privateKey, hashtag) => {
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

		if (!Hashtags.findOne({
				hashtag: hashtag,
				privateKey: privateKey
			})) {
			throw new Meteor.Error('EventManager.reset', 'plugins.splashscreen.error.error_messages.not_authorized');
		}

		EventManager.update({hashtag: hashtag}, {$set: {sessionStatus: 1, readingConfirmationIndex: -1, questionIndex: -1, eventStack: [{key: "EventManager.reset", value: {sessionStatus: 1, readingConfirmationIndex: -1, questionIndex: -1}}]}});
	},
	'EventManager.add': (privateKey, hashtag) => {
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

		if (!Hashtags.findOne({
				hashtag: hashtag,
				privateKey: privateKey
			})) {
			throw new Meteor.Error('EventManager.add', 'plugins.splashscreen.error.error_messages.not_authorized');
		}

		if (EventManager.findOne({hashtag: hashtag})) {
			throw new Meteor.Error('EventManager.add', 'plugins.splashscreen.error.error_messages.hashtag_exists');
		}
		EventManager.insert({
			hashtag: hashtag,
			sessionStatus: 1,
			lastConnection: 0,
			readingConfirmationIndex: -1,
			questionIndex: 0,
			eventStack: [{key: "EventManager.add", value: {sessionStatus: 1, readingConfirmationIndex: -1, questionIndex: -1}}]
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

			var doc = Hashtags.findOne({
				hashtag: hashtag,
				privateKey: privateKey
			});

			if (doc) {
				EventManager.update({hashtag: hashtag}, {$set: {lastConnection: (new Date()).getTime()}});
			}
		}
	}
});
