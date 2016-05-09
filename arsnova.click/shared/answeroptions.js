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

import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { AnswerOptionCollection } from '/lib/answeroptions/collection.js';
import { HashtagsCollection } from '/lib/hashtags/collection.js';
import { EventManagerCollection } from '/lib/eventmanager/collection.js';

Meteor.methods({
	'AnswerOptionCollection.addOption': function ({hashtag, questionIndex, answerText, answerOptionNumber, isCorrect}) {
		new SimpleSchema({
			hashtag: {type: String},
			questionIndex: {type: Number},
			answerText: {type: String},
			answerOptionNumber: {type: Number},
			isCorrect: {type: Number}
		}).validate({hashtag, questionIndex, answerText, answerOptionNumber, isCorrect});
		if (AnswerOptionCollection.find({
				hashtag: hashtag,
				questionIndex: questionIndex
			}).count() > 25) {
			throw new Meteor.Error('AnswerOptionCollection.addOption', 'maximum_answer_options_exceeded');
		}
		var answerOptionDoc = AnswerOptionCollection.findOne({
			hashtag: hashtag,
			questionIndex: questionIndex,
			answerOptionNumber: answerOptionNumber
		});
		if (!answerOptionDoc) {
			AnswerOptionCollection.insert({
				hashtag: hashtag,
				questionIndex: questionIndex,
				answerText: answerText,
				answerOptionNumber: answerOptionNumber,
				isCorrect: isCorrect
			});
			EventManagerCollection.update({hashtag: hashtag}, {
				$push: {
					eventStack: {
						key: "AnswerOptionCollection.addOption",
						value: {
							questionIndex: questionIndex,
							answerOptionNumber: answerOptionNumber
						}
					}
				}
			});
		} else {
			AnswerOptionCollection.update(answerOptionDoc._id, {
				$set: {
					answerText: answerText,
					isCorrect: isCorrect
				}
			});
			EventManagerCollection.update({hashtag: hashtag}, {
				$push: {
					eventStack: {
						key: "AnswerOptionCollection.updateOption",
						value: {
							questionIndex: questionIndex,
							answerOptionNumber: answerOptionNumber
						}
					}
				}
			});
		}
	},
	'AnswerOptionCollection.deleteOption': function ({hashtag, questionIndex, answerOptionNumber}) {
		new SimpleSchema({
			hashtag: {type: String},
			questionIndex: {type: Number},
			answerOptionNumber: {type: Number}
		}).validate({hashtag, questionIndex, answerOptionNumber});
		var query = {
			hashtag: hashtag,
			questionIndex: questionIndex,
			answerOptionNumber: answerOptionNumber
		};
		if (answerOptionNumber < 0) {
			delete query.answerOptionNumber;
			AnswerOptionCollection.remove(query);
			AnswerOptionCollection.update(
				{hashtag: hashtag, questionIndex: {$gt: questionIndex}},
				{$inc: {questionIndex: -1}},
				{multi: true}
			);
		} else {
			AnswerOptionCollection.remove(query);
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
			hashtag: {type: String},
			questionIndex: {type: Number},
			answerOptionNumber: {type: Number},
			answerText: {type: String},
			isCorrect: {type: Number}
		}).validate({hashtag, questionIndex, answerOptionNumber, answerText, isCorrect});
		var answerOptionDoc = AnswerOptionCollection.findOne({
			hashtag: hashtag,
			questionIndex: questionIndex,
			answerOptionNumber: answerOptionNumber
		});
		AnswerOptionCollection.update(answerOptionDoc._id, {
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
