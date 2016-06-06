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
import {ResponsesCollection, responseTimeSchema} from '/lib/responses/collection.js';
import {LeaderBoardCollection} from '/lib/leader_board/collection.js';
import {hashtagSchema} from '/lib/hashtags/collection.js';
import {userNickSchema} from '/lib/member_list/collection.js';
import {EventManagerCollection, questionIndexSchema} from '/lib/eventmanager/collection.js';

Meteor.methods({
	'LeaderBoardCollection.addResponseSet': function ({hashtag, questionIndex, nick, responseTime}) {
		new SimpleSchema({
			hashtag: hashtagSchema,
			questionIndex: questionIndexSchema,
			nick: userNickSchema,
			responseTime: responseTimeSchema
		}).validate({hashtag, questionIndex, nick, responseTime});

		if (Meteor.isServer) {
			const correctAnswers = [];

			AnswerOptionCollection.find({
				hashtag: hashtag,
				questionIndex: questionIndex,
				isCorrect: 1
			}, {fields: {"answerOptionNumber": 1}}).forEach(function (answer) {
				correctAnswers.push(answer.answerOptionNumber);
			});

			var responseAmount = 0;
			var falseResponseAmount = 0;

			ResponsesCollection.find({
				hashtag: hashtag,
				questionIndex: questionIndex,
				userNick: nick
			}).forEach(function (response) {
				if (typeof response.answerOptionNumber !== "undefined" && correctAnswers.indexOf(response.answerOptionNumber) === -1) {
					falseResponseAmount++;
				}
				responseAmount++;
			});

			var rightResponseAmount = responseAmount - falseResponseAmount;
console.log(rightResponseAmount, responseAmount, falseResponseAmount);
			var memberEntry = LeaderBoardCollection.findOne({
				hashtag: hashtag,
				questionIndex: questionIndex,
				userNick: nick
			});

			if (!memberEntry) {
				LeaderBoardCollection.insert({
					hashtag: hashtag,
					questionIndex: questionIndex,
					userNick: nick,
					responseTime: responseTime,
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
			EventManagerCollection.update({hashtag: hashtag}, {
				$push: {
					eventStack: {
						key: "LeaderBoardCollection.addResponseSet",
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
