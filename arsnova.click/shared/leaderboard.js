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
import {AnswerOptionCollection} from '/lib/answeroptions/collection.js';
import {ResponsesCollection} from '/lib/responses/collection.js';
import {LeaderBoardCollection} from '/lib/leader_board/collection.js';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';

Meteor.methods({
	'LeaderBoard.addResponseSet': function ({phashtag, questionIndex, nick, responseTimeMillis}) {
		if (Meteor.isServer) {
			new SimpleSchema({
				phashtag: {type: String},
				questionIndex: {type: Number},
				nick: {type: String},
				responseTimeMillis: {type: Number}
			}).validate({
				phashtag,
				questionIndex,
				nick,
				responseTimeMillis
			});

			const correctAnswers = [];

			AnswerOptionCollection.find({
				hashtag: phashtag,
				questionIndex: questionIndex,
				isCorrect: 1
			}, {fields: {"answerOptionNumber": 1}}).forEach(function (answer) {
				correctAnswers.push(answer.answerOptionNumber);
			});

			var responseAmount = 0;
			var falseResponseAmount = 0;

			ResponsesCollection.find({
				hashtag: phashtag,
				questionIndex: questionIndex,
				userNick: nick
			}).forEach(function (response) {
				if (correctAnswers.indexOf(response.answerOptionNumber) === -1) {
					falseResponseAmount++;
				}
				responseAmount++;
			});

			var rightResponseAmount = responseAmount - falseResponseAmount;

			var memberEntry = LeaderBoardCollection.findOne({
				hashtag: phashtag,
				questionIndex: questionIndex,
				userNick: nick
			});

			if (!memberEntry) {
				LeaderBoardCollection.insert({
					hashtag: phashtag,
					questionIndex: questionIndex,
					userNick: nick,
					responseTimeMillis: responseTimeMillis,
					givenAnswers: responseAmount,
					rightAnswers: rightResponseAmount,
					wrongAnswers: falseResponseAmount
				});
			} else {
				LeaderBoardCollection.update(memberEntry._id, {
					$set: {
						givenAnswers: responseAmount,
						rightAnswers: rightResponseAmount,
						wrongAnswers: falseResponseAmount
					}
				});
			}
			EventManagerCollection.update({hashtag: phashtag}, {$push: {eventStack: {key: "LeaderBoard.addResponseSet",
				value: {
					nick: nick,
					questionIndex: questionIndex
				}
			}
			}
			});
		}
	}
});
