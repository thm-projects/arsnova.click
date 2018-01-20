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
import SimpleSchema from 'simpl-schema';
import {AnswerOptionCollection} from '/lib/answeroptions/collection.js';
import {MemberListCollection} from '/lib/member_list/collection.js';
import {ResponsesCollection} from '/lib/responses/collection.js';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {SessionConfigurationCollection} from '/lib/session_configuration/collection.js';
import {
	HashtagsCollection,
	hashtagsCollectionSchema,
	hashtagSchema,
	themeSchema,
	selectedNicksSchema
} from '/lib/hashtags/collection.js';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';

Meteor.methods({
	'HashtagsCollection.checkPrivateKey': (privateKey, hashtag) => {
		hashtagsCollectionSchema.validate({hashtag, privateKey});

		const doc = HashtagsCollection.findOne({
			hashtag: hashtag,
			privateKey: privateKey
		});
		return Boolean(doc);
	},
	'HashtagsCollection.addHashtag': (sessionConfiguration) => {
		new SimpleSchema({hashtag: hashtagSchema}).validate({hashtag: sessionConfiguration.hashtag});
		if (HashtagsCollection.findOne({hashtag: sessionConfiguration.hashtag})) {
			throw new Meteor.Error('HashtagsCollection.addHashtag', 'session_exists');
		}

		HashtagsCollection.insert(sessionConfiguration);
		EventManagerCollection.update({hashtag: sessionConfiguration.hashtag}, {
			$push: {
				eventStack: {
					key: "HashtagsCollection.addHashtag",
					value: {hashtag: sessionConfiguration.hashtag}
				}
			}
		});
	},
	'HashtagsCollection.setDefaultTheme': (hashtag, themeName = "theme-arsnova-dot-click-contrast") => {
		new SimpleSchema({hashtag: hashtagSchema, theme: themeSchema}).validate({hashtag: hashtag, theme: themeName});

		let queryParam = {};
		if (Meteor.isServer) {
			queryParam.hashtag = hashtag;
		}

		if (!HashtagsCollection.findOne(queryParam)) {
			throw new Meteor.Error('HashtagsCollection.setDefaultTheme', 'session_not_exists');
		}
		HashtagsCollection.update(queryParam, {
			$set: {
				theme: themeName
			}
		});
		EventManagerCollection.update({hashtag: hashtag}, {
			$push: {
				eventStack: {
					key: "HashtagsCollection.setDefaultTheme",
					value: {hashtag: hashtag, theme: themeName}
				}
			}
		});
	},
	'HashtagsCollection.setSelectedNicks': (hashtag, nicks) => {
		new SimpleSchema({
			hashtag: hashtagSchema,
			selectedNicks: {type: [selectedNicksSchema]}
		}).validate({hashtag: hashtag, selectedNicks: nicks});

		let queryParam = {};
		if (Meteor.isServer) {
			queryParam.hashtag = hashtag;
		}

		if (!HashtagsCollection.findOne(queryParam)) {
			throw new Meteor.Error('HashtagsCollection.setSelectedNicks', 'session_not_exists');
		}
		HashtagsCollection.update(queryParam, {
			$set: {
				selectedNicks: nicks
			}
		});
		EventManagerCollection.update({hashtag: hashtag}, {
			$push: {
				eventStack: {
					key: "HashtagsCollection.setSelectedNicks",
					value: {hashtag: hashtag, selectedNicks: nicks}
				}
			}
		});
	},
	'HashtagsCollection.updateMusicSettings': (doc) => {
		var hashtagDoc = HashtagsCollection.findOne({hashtag: doc.hashtag});

		if (!hashtagDoc) {
			throw new Meteor.Error('HashtagsCollection.updateMusicSettings', 'session_not_exists');
		} else {
			HashtagsCollection.update(hashtagDoc._id, {
				$set: {
					musicVolume: doc.musicVolume,
					musicEnabled: doc.musicEnabled,
					musicTitle: doc.musicTitle
				}
			});

			EventManagerCollection.update({hashtag: doc.hashtag}, {
				$push: {
					eventStack: {
						key: "HashtagsCollection.updateMusicSettings",
						value: {hashtag: doc.hashtag}
					}
				}
			});
		}
	},
	'HashtagsCollection.export': ({hashtag}) => {
		new SimpleSchema({hashtag: hashtagSchema}).validate({hashtag});

		if (Meteor.isServer) {
			const hashtagDoc = HashtagsCollection.findOne({
				hashtag: hashtag
			}, {
				fields: {
					_id: 0,
					privateKey: 0
				}
			});
			if (!hashtagDoc) {
				throw new Meteor.Error('HashtagsCollection.export', 'hashtag_not_found');
			}
			const questionGroupDoc = QuestionGroupCollection.findOne({hashtag: hashtag}, {
				fields: {
					_id: 0
				}
			});
			const configDoc = SessionConfigurationCollection.findOne({hashtag: hashtag}, {
				fields: {
					_id: 0
				}
			});
			const answerOptionsDoc = AnswerOptionCollection.find({hashtag: hashtag}, {
				fields: {
					_id: 0
				}
			}).fetch();
			const memberListDoc = MemberListCollection.find({hashtag: hashtag}, {
				fields: {
					_id: 0
				}
			}).fetch();
			const responsesDoc = ResponsesCollection.find({hashtag: hashtag}, {
				fields: {
					_id: 0
				}
			}).fetch();
			const exportData = {
				hashtagDoc: hashtagDoc,
				configDoc: configDoc,
				questionGroupDoc: questionGroupDoc,
				answerOptionsDoc: answerOptionsDoc,
				memberListDoc: memberListDoc,
				responsesDoc: responsesDoc
			};
			return JSON.stringify(exportData);
		}
	},
	'HashtagsCollection.import': ({privateKey, data}) => {
		if (Meteor.isServer) {
			const hashtag = data.hashtag;
			const oldDoc = HashtagsCollection.findOne({hashtag: hashtag, privateKey: {$ne: privateKey}});
			if (oldDoc) {
				throw new Meteor.Error('HashtagsCollection.import', 'hashtag_exists');
			}
			const questionList = [];
			const hashtagDoc = data.hashtagDoc;

			if (!hashtagDoc.theme) {
				hashtagDoc.theme = "theme-arsnova-dot-click-contrast";
			}
			if (!hashtagDoc.musicVolume) {
				hashtagDoc.musicVolume = 80;
			}
			if (!hashtagDoc.musicEnabled) {
				hashtagDoc.musicEnabled = 1;
			}
			if (!hashtagDoc.musicTitle) {
				hashtagDoc.musicTitle = "Song1";
			}

			hashtagDoc.privateKey = privateKey;
			delete hashtagDoc._id;
			HashtagsCollection.insert(hashtagDoc);
			for (let i = 0; i < data.questionListDoc.length; i++) {
				const question = data.questionListDoc[i];
				questionList.push({
					hashtag: question.hashtag,
					questionText: question.questionText,
					timer: question.timer,
					startTime: question.startTime,
					questionIndex: question.questionIndex,
					answerOptionList: [],
					type: question.type
				});
				for (let j = 0; j < question.answerOptionList.length; j++) {
					const answer = question.answerOptionList[j];
					AnswerOptionCollection.insert({
						hashtag: answer.hashtag,
						questionIndex: answer.questionIndex,
						answerText: answer.answerText,
						answerOptionNumber: answer.answerOptionNumber,
						isCorrect: answer.isCorrect,
						type: answer.type
					});
					questionList[i].answerOptionList.push({
						hashtag: answer.hashtag,
						questionIndex: answer.questionIndex,
						answerText: answer.answerText,
						answerOptionNumber: answer.answerOptionNumber,
						isCorrect: answer.isCorrect,
						type: answer.type
					});
				}
			}
			QuestionGroupCollection.insert({
				hashtag: hashtag,
				questionList: questionList
			});

			EventManagerCollection.update({hashtag: data.hashtagDoc}, {
				$push: {
					eventStack: {
						key: "HashtagsCollection.import",
						value: {hashtag: data.hashtagDoc}
					}
				}
			});
		}
	}
});
