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
import {AnswerOptions} from '/lib/answeroptions.js';
import {Responses} from '/lib/responses.js';
import {QuestionGroup} from '/lib/questions.js';
import {Hashtags} from '/lib/hashtags.js';

Meteor.methods({
	'Responses.addResponse'(responseDoc) {
		var timestamp = new Date().getTime();
		var hashtag = responseDoc.hashtag;
		if (Meteor.isServer) {
			var dupDoc = Responses.findOne({
				hashtag: responseDoc.hashtag,
				questionIndex: responseDoc.questionIndex,
				answerOptionNumber: responseDoc.answerOptionNumber,
				userNick: responseDoc.userNick
			});
			if (dupDoc) {
				throw new Meteor.Error('Responses.addResponse', 'plugins.splashscreen.error.error_messages.duplicate_response');
			}
			var hashtagDoc = Hashtags.findOne({
				hashtag: hashtag
			});
			if (!hashtagDoc) {
				throw new Meteor.Error('Responses.addResponse', 'plugins.splashscreen.error.error_messages.not_authorized');
			} else {
				var questionGroupDoc = QuestionGroup.findOne({hashtag: responseDoc.hashtag});
				if (!questionGroupDoc) {
					throw new Meteor.Error('Responses.addResponse', 'plugins.splashscreen.error.error_messages.hashtag_not_found');
				}
				var responseTime = Number(timestamp) - Number(questionGroupDoc.questionList[responseDoc.questionIndex].startTime);

				if (responseTime <= questionGroupDoc.questionList[responseDoc.questionIndex].timer) {
					responseDoc.responseTime = responseTime;
					var answerOptionDoc = AnswerOptions.findOne({
						hashtag: hashtag,
						questionIndex: responseDoc.questionIndex,
						answerOptionNumber: responseDoc.answerOptionNumber
					});
					if (!answerOptionDoc) {
						throw new Meteor.Error('Responses.addResponse', 'plugins.splashscreen.error.error_messages.answeroption_not_found');
					}

					Responses.insert(responseDoc);

					Meteor.call('LeaderBoard.addResponseSet', {
						phashtag: responseDoc.hashtag,
						questionIndex: responseDoc.questionIndex,
						nick: responseDoc.userNick,
						responseTimeMillis: responseDoc.responseTime
					}, (err) => {
						if (err) {
							throw new Meteor.Error('Responses.addResponse', 'plugins.splashscreen.error.error_messages.insert_leaderboard_failed');
						}
					});
				} else {
					throw new Meteor.Error('Responses.addResponse', 'plugins.splashscreen.error.error_messages.response_timeout');
				}
			}
		}
	},
	'Responses.clearAll': function (privateKey, hashtag) {
		if (Meteor.isServer) {
			var hashtagDoc = Hashtags.findOne({
				hashtag: hashtag,
				privateKey: privateKey
			});
			if (!hashtagDoc) {
				throw new Meteor.Error('Responses.clearAll', 'plugins.splashscreen.error.error_messages.not_authorized');
			}

			Responses.remove({hashtag: hashtag});
		}
	}
});
