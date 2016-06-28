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
import * as answerOptionLib from '/lib/answeroptions/collection.js';
import {EventManagerCollection, questionIndexSchema} from '/lib/eventmanager/collection.js';
import {hashtagSchema} from '/lib/hashtags/collection.js';

Meteor.methods({
	'AnswerOptionCollection.addOption': function (answerDoc) {
		const schema = {
			hashtag: hashtagSchema,
			questionIndex: questionIndexSchema,
			answerText: answerOptionLib.answerTextSchema,
			answerOptionNumber: answerOptionLib.answerOptionNumberSchema
		};
		const validation = {
			hashtag: answerDoc.hashtag,
			questionIndex: answerDoc.questionIndex,
			answerText: answerDoc.answerText,
			answerOptionNumber: answerDoc.answerOptionNumber
		};
		if (answerDoc.type === "DefaultAnswerOption") {
			schema.isCorrect = answerOptionLib.isCorrectSchema;
			validation.isCorrect = answerDoc.isCorrect;
		} else if (answerDoc.type === "FreeTextAnswerOption") {
			schema.configCaseSensitive = answerOptionLib.configCaseSensitiveSchema;
			schema.configUseKeywords = answerOptionLib.configUseKeywordsSchema;
			schema.configTrimWhitespaces = answerOptionLib.configTrimWhitespacesSchema;
			schema.configUsePunctuation = answerOptionLib.configUsePunctuationSchema;
			validation.configCaseSensitive = answerDoc.configCaseSensitive;
			validation.configUseKeywords = answerDoc.configUseKeywords;
			validation.configTrimWhitespaces = answerDoc.configTrimWhitespaces;
			validation.configUsePunctuation = answerDoc.configUsePunctuation;
		}
		new SimpleSchema(schema).validate(validation);

		if (answerOptionLib.AnswerOptionCollection.find({
				hashtag: answerDoc.hashtag,
				questionIndex: answerDoc.questionIndex
			}).count() > 25) {
			throw new Meteor.Error('AnswerOptionCollection.addOption', 'maximum_answer_options_exceeded');
		}
		var answerOptionDoc = answerOptionLib.AnswerOptionCollection.findOne({
			hashtag: answerDoc.hashtag,
			questionIndex: answerDoc.questionIndex,
			answerOptionNumber: answerDoc.answerOptionNumber
		});
		if (!answerOptionDoc) {
			const insertObj = {
				hashtag: answerDoc.hashtag,
				questionIndex: answerDoc.questionIndex,
				answerText: answerDoc.answerText,
				answerOptionNumber: answerDoc.answerOptionNumber,
				isCorrect: answerDoc.isCorrect
			};
			if (answerDoc.type === "DefaultAnswerOption") {
				insertObj.isCorrect = answerDoc.isCorrect;
			} else if (answerDoc.type === "FreeTextAnswerOption") {
				insertObj.configCaseSensitive = answerDoc.configCaseSensitive;
				insertObj.configUseKeywords = answerDoc.configUseKeywords;
				insertObj.configTrimWhitespaces = answerDoc.configTrimWhitespaces;
				insertObj.configUsePunctuation = answerDoc.configUsePunctuation;
			}
			answerOptionLib.AnswerOptionCollection.insert(insertObj);
			EventManagerCollection.update({hashtag: answerDoc.hashtag}, {
				$push: {
					eventStack: {
						key: "AnswerOptionCollection.addOption",
						value: {
							questionIndex: answerDoc.questionIndex,
							answerOptionNumber: answerDoc.answerOptionNumber
						}
					}
				}
			});
		} else {
			const updateObject = {
				$set: {
					answerText: answerDoc.answerText
				}
			};
			if (answerDoc.type === "DefaultAnswerOption") {
				updateObject.$set.isCorrect = answerDoc.isCorrect;
			} else if (answerDoc.type === "FreeTextAnswerOption") {
				updateObject.$set.configCaseSensitive = answerDoc.configCaseSensitive;
				updateObject.$set.configUseKeywords = answerDoc.configUseKeywords;
				updateObject.$set.configTrimWhitespaces = answerDoc.configTrimWhitespaces;
				updateObject.$set.configUsePunctuation = answerDoc.configUsePunctuation;
			}
			answerOptionLib.AnswerOptionCollection.update(answerOptionDoc._id, updateObject);
			EventManagerCollection.update({hashtag: answerDoc.hashtag}, {
				$push: {
					eventStack: {
						key: "AnswerOptionCollection.updateOption",
						value: {
							questionIndex: answerDoc.questionIndex,
							answerOptionNumber: answerDoc.answerOptionNumber
						}
					}
				}
			});
		}
	},
	'AnswerOptionCollection.deleteOption': function ({hashtag, questionIndex, answerOptionNumber}) {
		new SimpleSchema({
			hashtag: hashtagSchema,
			questionIndex: questionIndexSchema,
			answerOptionNumber: answerOptionLib.answerOptionNumberSchema
		}).validate({hashtag, questionIndex, answerOptionNumber});

		var query = {
			hashtag: hashtag,
			questionIndex: questionIndex,
			answerOptionNumber: answerOptionNumber
		};
		if (answerOptionNumber < 0) {
			delete query.answerOptionNumber;
			answerOptionLib.AnswerOptionCollection.remove(query);
			answerOptionLib.AnswerOptionCollection.update(
				{hashtag: hashtag, questionIndex: {$gt: questionIndex}},
				{$inc: {questionIndex: -1}},
				{multi: true}
			);
		} else {
			answerOptionLib.AnswerOptionCollection.remove(query);
		}
		EventManagerCollection.update({hashtag: hashtag}, {
			$push: {
				eventStack: {
					key: "AnswerOptionCollection.deleteOption",
					value: {
						questionIndex: questionIndex,
						answerOptionNumber: answerOptionNumber
					}
				}
			}
		});
	},
	'AnswerOptionCollection.updateAnswerTextAndIsCorrect': function ({hashtag, questionIndex, answerOptionNumber, answerText, isCorrect}) {
		new SimpleSchema({
			hashtag: hashtagSchema,
			questionIndex: questionIndexSchema,
			answerText: answerOptionLib.answerTextSchema,
			answerOptionNumber: answerOptionLib.answerOptionNumberSchema,
			isCorrect: answerOptionLib.isCorrectSchema
		}).validate({hashtag, questionIndex, answerOptionNumber, answerText, isCorrect});

		var answerOptionDoc = answerOptionLib.AnswerOptionCollection.findOne({
			hashtag: hashtag,
			questionIndex: questionIndex,
			answerOptionNumber: answerOptionNumber
		});
		answerOptionLib.AnswerOptionCollection.update(answerOptionDoc._id, {
			$set: {answerText: answerText, isCorrect: isCorrect}
		});
		EventManagerCollection.update({hashtag: hashtag}, {
			$push: {
				eventStack: {
					key: "AnswerOptionCollection.updateAnswerTextAndIsCorrect",
					value: {
						questionIndex: questionIndex,
						answerOptionNumber: answerOptionDoc
					}
				}
			}
		});
		return {
			hashtag, questionIndex, answerOptionNumber, answerText, isCorrect
		};
	}
});
