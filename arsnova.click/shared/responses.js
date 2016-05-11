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
import {AnswerOptionCollection} from '/lib/answeroptions/collection.js';
import {ResponsesCollection} from '/lib/responses/collection.js';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {HashtagsCollection} from '/lib/hashtags/collection.js';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';

Meteor.methods({
	'ResponsesCollection.addResponse': function (responseDoc) {
		var timestamp = new Date().getTime();
		var hashtag = responseDoc.hashtag;
		var dupDoc = ResponsesCollection.findOne({
			hashtag: responseDoc.hashtag,
			questionIndex: responseDoc.questionIndex,
			answerOptionNumber: responseDoc.answerOptionNumber,
			userNick: responseDoc.userNick
		});
		if (dupDoc) {
			throw new Meteor.Error('ResponsesCollection.addResponse', 'duplicate_response');
		}
		const query = {};
		if (Meteor.isServer) {
			query.hashtag = responseDoc.hashtag;
		}
		var questionGroupDoc = QuestionGroupCollection.findOne(query);
		if (!questionGroupDoc) {
			throw new Meteor.Error('ResponsesCollection.addResponse', 'hashtag_not_found');
		}
		var responseTime = Number(timestamp) - Number(questionGroupDoc.questionList[responseDoc.questionIndex].startTime);

		if (responseTime > questionGroupDoc.questionList[responseDoc.questionIndex].timer) {
			throw new Meteor.Error('ResponsesCollection.addResponse', 'response_timeout');
		}
		responseDoc.responseTime = responseTime;
		var answerOptionDoc = AnswerOptionCollection.findOne({
			hashtag: hashtag,
			questionIndex: responseDoc.questionIndex,
			answerOptionNumber: responseDoc.answerOptionNumber
		});
		if (!answerOptionDoc) {
			throw new Meteor.Error('ResponsesCollection.addResponse', 'answeroption_not_found');
		}

		ResponsesCollection.insert(responseDoc);

		Meteor.call('LeaderBoardCollection.addResponseSet', {
			phashtag: responseDoc.hashtag,
			questionIndex: responseDoc.questionIndex,
			nick: responseDoc.userNick,
			responseTimeMillis: responseDoc.responseTime
		});
		EventManagerCollection.update({hashtag: hashtag}, {
			$push: {
				eventStack: {
					key: "ResponsesCollection.addResponse",
					value: {
						questionIndex: responseDoc.questionIndex,
						answerOptionNumber: responseDoc.answerOptionNumber,
						userNick: responseDoc.userNick
					}
				}
			}
		});
	},
	'ResponsesCollection.clearAll': function (hashtag) {
		ResponsesCollection.remove({hashtag: hashtag});
		EventManagerCollection.update({hashtag: hashtag}, {
			$push: {
				eventStack: {
					key: "ResponsesCollection.clearAll",
					value: {}
				}
			}
		});
	}
});
