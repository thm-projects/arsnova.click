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
import {hashtagSchema} from '/lib/hashtags/collection.js';
import {QuestionGroupCollection, questionGroupSchema, questionTextSchema, timerSchema} from '/lib/questions/collection.js';
import {EventManagerCollection, questionIndexSchema} from '/lib/eventmanager/collection.js';

Meteor.methods({
	"QuestionGroupCollection.insert": function (questionGroup) {
		questionGroupSchema.validate({
			hashtag: questionGroup.hashtag,
			questionList: questionGroup.questionList
		});

		const query = {};
		if (Meteor.isServer) {
			query.hashtag = questionGroup.hashtag;
		}
		QuestionGroupCollection.update(query, questionGroup, {upsert: true});
		for (let i = 0; i < questionGroup.questionList.length; i++) {
			const questionItem = questionGroup.questionList[i];
			for (let j = 0; j < questionItem.answerOptionList.length; j++) {
				const answerItem = questionItem.answerOptionList[j];
				Meteor.call("AnswerOptionCollection.addOption", answerItem);
			}
		}
		EventManagerCollection.update({hashtag: questionGroup.hashtag}, {
			$push: {
				eventStack: {
					key: "QuestionGroupCollection.insert",
					value: {}
				}
			}
		});
	},
	"QuestionGroupCollection.addQuestion": function (questionItem) {
		new SimpleSchema({
			hashtag: hashtagSchema,
			questionIndex: questionIndexSchema,
			questionText: questionTextSchema
		}).validate({hashtag: questionItem.hashtag, questionIndex: questionItem.getQuestionIndex(), questionText: questionItem.getQuestionText()});

		const query = {};
		if (Meteor.isServer) {
			query.hashtag = questionItem.hashtag;
		}
		var questionGroup = QuestionGroupCollection.findOne(query);
		if (!questionGroup) {
			QuestionGroupCollection.insert({
				hashtag: questionItem.hashtag,
				questionList: [questionItem]
			});
		} else {
			if (questionItem.getQuestionIndex() < questionGroup.questionList.length) {
				questionGroup.questionList[questionItem.getQuestionIndex()].questionText = questionItem.getQuestionIndex();
			} else {
				questionGroup.questionList.push(questionItem.serialize());
			}
			QuestionGroupCollection.update(questionGroup._id, {$set: {questionList: questionGroup.questionList}});
		}
		EventManagerCollection.update({hashtag: questionItem.hashtag}, {
			$push: {
				eventStack: {
					key: "QuestionGroupCollection.addQuestion",
					value: {questionIndex: questionItem.getQuestionIndex()}
				}
			}
		});
	},
	"QuestionGroupCollection.removeQuestion": function ({hashtag, questionIndex}) {
		new SimpleSchema({
			hashtag: hashtagSchema,
			questionIndex: questionIndexSchema
		}).validate({hashtag, questionIndex});

		const query = {};
		if (Meteor.isServer) {
			query.hashtag = hashtag;
		}
		var questionGroup = QuestionGroupCollection.findOne(query);
		if (questionGroup) {
			questionGroup.questionList.splice(questionIndex, 1);
			QuestionGroupCollection.update(questionGroup._id, {$set: {questionList: questionGroup.questionList}});
		}
		EventManagerCollection.update({hashtag: hashtag}, {
			$push: {
				eventStack: {
					key: "QuestionGroupCollection.addQuestion",
					value: {questionIndex: questionIndex}
				}
			}
		});
	},
	"QuestionGroupCollection.persist": function (questionGroupElement) {
		new SimpleSchema({
			hashtag: hashtagSchema
		}).validate({hashtag: questionGroupElement.hashtag});

		Meteor.call("QuestionGroupCollection.insert", questionGroupElement);

		EventManagerCollection.update({hashtag: questionGroupElement.hashtag}, {
			$push: {
				eventStack: {
					key: "QuestionGroupCollection.persist",
					value: {questionGroupElement: questionGroupElement}
				}
			}
		});
	},
	"Question.isSC": function ({hashtag, questionIndex}) {
		new SimpleSchema({
			hashtag: hashtagSchema,
			questionIndex: questionIndexSchema
		}).validate({hashtag, questionIndex});

		return (AnswerOptionCollection.find({
			hashtag: hashtag,
			questionIndex: questionIndex,
			isCorrect: true
		}).count() === 1);
	},
	"Question.setTimer": function ({hashtag, questionIndex, timer}) {
		new SimpleSchema({
			hashtag: hashtagSchema,
			questionIndex: questionIndexSchema,
			timer: timerSchema
		}).validate({hashtag, questionIndex, timer});

		const query = {};
		if (Meteor.isServer) {
			query.hashtag = hashtag;
		}
		var questionGroup = QuestionGroupCollection.findOne(query);
		if (!questionGroup) {
			throw new Meteor.Error('Question.setTimer', 'hashtag_not_found');
		}

		questionGroup.questionList[questionIndex].timer = timer;
		QuestionGroupCollection.update(questionGroup._id, {$set: {questionList: questionGroup.questionList}});
		EventManagerCollection.update({hashtag: hashtag}, {
			$push: {
				eventStack: {
					key: "QuestionGroupCollection.setTimer",
					value: {
						questionIndex: questionIndex,
						timer: timer
					}
				}
			}
		});
	},
	"Question.startTimer": function ({hashtag, questionIndex}) {
		if (Meteor.isClient) {
			return;
		}
		new SimpleSchema({
			hashtag: hashtagSchema,
			questionIndex: questionIndexSchema
		}).validate({hashtag, questionIndex});

		var startTime = new Date();

		const query = {};
		if (Meteor.isServer) {
			query.hashtag = hashtag;
		}
		var questionGroup = QuestionGroupCollection.findOne(query);
		if (!questionGroup) {
			throw new Meteor.Error('Question.startTimer', 'hashtag_not_found');
		}
		questionGroup.questionList[questionIndex].startTime = startTime.getTime();
		QuestionGroupCollection.update(questionGroup._id, {$set: {questionList: questionGroup.questionList}});
		EventManagerCollection.update({hashtag: hashtag}, {
			$push: {
				eventStack: {
					key: "QuestionGroupCollection.setTimer",
					value: {questionIndex: questionIndex}
				}
			}
		});
	}
});
