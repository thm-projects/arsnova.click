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
import {EventManagerCollection, sessionStatusSchema, readingConfirmationIndexSchema, questionIndexSchema} from '/lib/eventmanager/collection.js';
import {hashtagSchema} from '/lib/hashtags/collection.js';

Meteor.methods({
	'EventManagerCollection.startQuiz': (hashtag, index)=> {
		new SimpleSchema({
			hashtag: hashtagSchema
		}).validate({hashtag});

		const query = {};
		if (Meteor.isServer) {
			query.hashtag = hashtag;
		}
		Meteor.call('Question.startTimer', {hashtag: hashtag, questionIndex: 0});
		EventManagerCollection.update(query, {
			$set: {
				sessionStatus: 3,
				questionIndex: index,
				readingConfirmationIndex: 0
			},
			$push: {
				eventStack: {
					key: "EventManagerCollection.startQuiz",
					value: {
						sessionStatus: 3,
						questionIndex: index,
						readingConfirmationIndex: 0
					}
				}
			}
		});
	},
	'EventManagerCollection.setSessionStatus': (hashtag, sessionStatus)=> {
		new SimpleSchema({
			hashtag: hashtagSchema,
			sessionStatus: sessionStatusSchema
		}).validate({hashtag, sessionStatus});

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
	'EventManagerCollection.setQuestionIndex': (hashtag, questionIndex)=> {
		new SimpleSchema({
			hashtag: hashtagSchema,
			questionIndex: questionIndexSchema
		}).validate({hashtag, questionIndex});

		EventManagerCollection.update({hashtag: hashtag}, {
			$set: {
				questionIndex: questionIndex
			},
			$push: {
				eventStack: {
					key: "EventManagerCollection.setQuestionIndex",
					value: {questionIndex: questionIndex}
				}
			}
		});
	},
	'EventManagerCollection.showReadConfirmedForIndex': (hashtag, readingConfirmationIndex)=> {
		new SimpleSchema({
			hashtag: hashtagSchema,
			readingConfirmationIndex: readingConfirmationIndexSchema
		}).validate({hashtag, readingConfirmationIndex});

		EventManagerCollection.update({hashtag: hashtag}, {
			$set: {
				readingConfirmationIndex: readingConfirmationIndex
			},
			$push: {
				eventStack: {
					key: "EventManagerCollection.showReadConfirmedForIndex",
					value: {readingConfirmationIndex: readingConfirmationIndex}
				}
			}
		});
	},
	'EventManagerCollection.setActiveQuestion': (hashtag, questionIndex)=> {
		new SimpleSchema({
			hashtag: hashtagSchema,
			questionIndex: questionIndexSchema
		}).validate({hashtag, questionIndex});

		EventManagerCollection.update({hashtag: hashtag}, {
			$set: {
				questionIndex: questionIndex,
				readingConfirmationIndex: questionIndex
			},
			$push: {
				eventStack: {
					key: "EventManagerCollection.setActiveQuestion",
					value: {
						questionIndex: questionIndex,
						readingConfirmationIndex: questionIndex
					}
				}
			}
		});
	},
	'EventManagerCollection.clear': (hashtag) => {
		new SimpleSchema({hashtag: hashtagSchema}).validate({hashtag});

		EventManagerCollection.remove({hashtag: hashtag});
	},
	'EventManagerCollection.beforeClear': (hashtag) => {
		new SimpleSchema({hashtag: hashtagSchema}).validate({hashtag});

		const query = {};
		if (Meteor.isServer) {
			query.hashtag = hashtag;
		}
		EventManagerCollection.update(query, {
			$push: {
				eventStack: {
					key: "EventManagerCollection.beforeClear",
					value: {}
				}
			}
		});
	},
	'EventManagerCollection.reset': (hashtag) => {
		new SimpleSchema({hashtag: hashtagSchema}).validate({hashtag});

		EventManagerCollection.update({hashtag: hashtag}, {
			$set: {
				sessionStatus: 1,
				readingConfirmationIndex: 0,
				questionIndex: 0,
				eventStack: [
					{
						key: "EventManagerCollection.reset",
						value: {
							sessionStatus: 1,
							readingConfirmationIndex: 0,
							questionIndex: 0
						}
					}
				]
			}
		});
	},
	'EventManagerCollection.add': (hashtag) => {
		new SimpleSchema({hashtag: hashtagSchema}).validate({hashtag});

		if (EventManagerCollection.findOne({hashtag: hashtag})) {
			throw new Meteor.Error('EventManagerCollection.add', 'hashtag_exists');
		}
		EventManagerCollection.insert({
			hashtag: hashtag,
			sessionStatus: 1,
			lastConnection: 0,
			readingConfirmationIndex: 0,
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
		new SimpleSchema({hashtag: hashtagSchema}).validate({hashtag});

		EventManagerCollection.update({hashtag: hashtag}, {$set: {lastConnection: (new Date()).getTime()}});
	}
});
