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
import {ResponsesCollection, rangedInputValueSchema, freeTextInputValueSchema} from '/lib/responses/collection.js';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {MemberListCollection} from '/lib/member_list/collection.js';
import {userNickSchema} from '/lib/member_list/collection.js';
import {hashtagSchema} from '/lib/hashtags/collection.js';
import {EventManagerCollection, questionIndexSchema} from '/lib/eventmanager/collection.js';

Meteor.methods({
	'ResponsesCollection.addResponse': function (responseDoc) {
		new SimpleSchema({
			hashtag: hashtagSchema,
			questionIndex: questionIndexSchema,
			userNick: userNickSchema
		}).validate({
			hashtag: responseDoc.hashtag,
			questionIndex: responseDoc.questionIndex,
			userNick: responseDoc.userNick
		});

		const responseValueObject = {};
		const hashtag = responseDoc.hashtag;

		if (typeof responseDoc.answerOptionNumber === "undefined") {
			if (typeof responseDoc.rangedInputValue !== "undefined") {
				new SimpleSchema({
					rangedInputValue: rangedInputValueSchema
				}).validate({rangedInputValue: responseDoc.rangedInputValue});
				responseValueObject.rangedInputValue = responseDoc.rangedInputValue;
			} else if (typeof responseDoc.freeTextInputValue !== "undefined") {
				new SimpleSchema({
					freeTextInputValue: freeTextInputValueSchema
				}).validate({freeTextInputValue: responseDoc.freeTextInputValue});
				responseValueObject.freeTextInputValue = responseDoc.freeTextInputValue;
				responseValueObject.answerOptionNumber = [0];
			} else {
				throw new Meteor.Error("ResponsesCollection.addResponse", "invalid_response_value");
			}
		} else {
			responseValueObject.answerOptionNumber = responseDoc.answerOptionNumber;
		}
		const duplicateResponseSearch = {
			hashtag: hashtag,
			questionIndex: responseDoc.questionIndex,
			userNick: responseDoc.userNick
		};
		if (typeof responseValueObject.rangedInputValue !== "undefined") {
			duplicateResponseSearch.rangedInputValue = responseValueObject.rangedInputValue;
		} else if (typeof responseValueObject.freeTextInputValue !== "undefined") {
			duplicateResponseSearch.freeTextInputValue = responseValueObject.freeTextInputValue;
			duplicateResponseSearch.answerOptionNumber = responseValueObject.answerOptionNumber;
		} else {
			duplicateResponseSearch.answerOptionNumber = responseValueObject.answerOptionNumber;
		}
		const dupDoc = ResponsesCollection.findOne(duplicateResponseSearch);
		if (dupDoc) {
			throw new Meteor.Error('ResponsesCollection.addResponse', 'duplicate_response');
		}
		const query = {};
		if (Meteor.isServer) {
			query.hashtag = hashtag;
		}
		const questionGroupDoc = QuestionGroupCollection.findOne(query);
		if (!questionGroupDoc) {
			throw new Meteor.Error('ResponsesCollection.addResponse', 'hashtag_not_found');
		}
		const questionItem = questionGroupDoc.questionList[responseDoc.questionIndex];
		const responseTime = Number(new Date().getTime()) - Number(questionItem.startTime);
		if (responseTime > questionItem.timer * 1000) {
			throw new Meteor.Error('ResponsesCollection.addResponse', 'response_timeout');
		}
		responseDoc.responseTime = responseTime;
		let foundAnswerBase = null;
		if (typeof responseValueObject.answerOptionNumber === "undefined") {
			// We have a ranged input here - check if the values are set in the question
			foundAnswerBase = typeof questionItem.rangeMin !== "undefined" && typeof questionItem.rangeMax !== "undefined";
		} else {
			// This will fetch either DefaultAnswerOptions and FreeTextAnswerOptions matching the current question
			foundAnswerBase = AnswerOptionCollection.findOne({
				hashtag: hashtag,
				questionIndex: responseDoc.questionIndex,
				answerOptionNumber: {$in: responseDoc.answerOptionNumber}
			});
		}
		if (!foundAnswerBase) {
			throw new Meteor.Error('ResponsesCollection.addResponse', 'response_type_not_found');
		}

		const member = MemberListCollection.findOne({hashtag: hashtag, nick: responseDoc.userNick}, {userRef: 1});
		const user = Meteor.users.findOne({_id: member.userRef});
		if (member && user) {
			responseDoc.userRef = member.userRef;
			responseDoc.profile = JSON.stringify(user.profile);
		}
		ResponsesCollection.insert(responseDoc);
		EventManagerCollection.update({hashtag: hashtag}, {
			$push: {
				eventStack: {
					key: "ResponsesCollection.addResponse",
					value: {
						questionIndex: responseDoc.questionIndex,
						responseValue: responseValueObject,
						userNick: responseDoc.userNick
					}
				}
			}
		});
	},
	'ResponsesCollection.clearAll': function (hashtag) {
		new SimpleSchema({hashtag: hashtagSchema}).validate({hashtag});

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
