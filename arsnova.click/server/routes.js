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

import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {Router} from 'meteor/iron:router';
import {HashtagsCollection, hashtagSchema} from '/lib/hashtags/collection.js';
import {QuestionGroupCollection, questionGroupSchema} from '/lib/questions/collection.js';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {SessionConfigurationCollection} from '/lib/session_configuration/collection.js';
import * as SingleChoiceExcelSheet from '/server/export_templates/excel_singlechoice_template.js';
import fs from 'fs';
import process from 'process';
import xlsx from 'excel4node';

Router.route("/server/preview/:themeName/:language", function () {
	const self = this,
		path = process.cwd() + '/arsnova_click_preview_' + self.params.themeName + "_" + self.params.language + '.png';

	fs.access(path, function (error) {
		if (error) {
			/* File not found (perhaps server is currently restarting) */
			self.response.writeHead(404);
			self.response.end("404 - File not found");
		} else {
			fs.readFile(path, function (err, data) {
				if (err) {
					throw err;
				}
				self.response.end(data);
			});
		}
	});
}, {where: "server"});

Router.route("/server/generateExcelFile/:hashtag/", function () {
	const wb = new xlsx.Workbook();
	const questionGroup = QuestionGroupCollection.findOne({hashtag: this.params.hashtag});
	for (let i = 0; i < questionGroup.questionList.length; i++) {
		switch (questionGroup.questionList[i].type) {
			case "SingleChoiceQuestion":
			case "YesNoSingleChoiceQuestion":
			case "TrueFalseSingleChoiceQuestion":
				SingleChoiceExcelSheet.generateSheet(wb, this.params.hashtag, i);
				break;

		}
	}
	const date = new Date();
	wb.write("Export-" + this.params.hashtag + "-" + date.getDate() + "_" + (date.getMonth() + 1) + "_" + date.getFullYear() + ".xlsx", this.response);
}, {where: 'server'});

Router.route('/api/keepalive', {where: 'server'})
	.post(function () {
		var sessionConfiguration = this.request.body.sessionConfiguration;
		var hashtag = decodeURIComponent(sessionConfiguration.hashtag);
		var privateKey = decodeURIComponent(sessionConfiguration.privateKey);

		if (!HashtagsCollection.findOne({hashtag: hashtag})) {
			this.response.writeHead(500);
			this.response.end("Hashtag not found");
		}

		if (HashtagsCollection.findOne({hashtag: hashtag}).privateKey !== privateKey) {
			this.response.writeHead(500);
			this.response.end("Missing permissions.");
		}

		Meteor.call('keepalive', hashtag);
	});

Router.route('/api/addHashtag', {where: 'server'})
	.post(function () {
		var sessionConfiguration = this.request.body.sessionConfiguration;
		sessionConfiguration.hashtag = decodeURIComponent(sessionConfiguration.hashtag);
		sessionConfiguration.privateKey = decodeURIComponent(sessionConfiguration.privateKey);

		new SimpleSchema({hashtag: hashtagSchema}).validate({hashtag: sessionConfiguration.hashtag});
		if (HashtagsCollection.findOne({hashtag: sessionConfiguration.hashtag})) {
			this.response.writeHead(500);
			this.response.end("Hashtag already in use");
		}

		var hashtagDoc = {
			hashtag: sessionConfiguration.hashtag,
			privateKey: sessionConfiguration.privateKey
		};
		HashtagsCollection.insert(hashtagDoc);
		EventManagerCollection.update({hashtag: sessionConfiguration.hashtag}, {
			$push: {
				eventStack: {
					key: "HashtagsCollection.addHashtag",
					value: {hashtag: sessionConfiguration.hashtag}
				}
			}
		});

		this.response.writeHead(200);
		this.response.end("Hashtag successfully created");
	});

Router.route('/api/createPrivateKey', {where: 'server'})
	.get(function () {
		this.response.writeHead(200);
		this.response.end(new Mongo.ObjectID()._str);
	});

Router.route('/api/removeLocalData', {where: 'server'})
	.post(function () {
		var sessionConfiguration = this.request.body.sessionConfiguration;
		var hashtag = decodeURIComponent(sessionConfiguration.hashtag);
		var privateKey = decodeURIComponent(sessionConfiguration.privateKey);

		if (!HashtagsCollection.findOne({hashtag: hashtag})) {
			this.response.writeHead(500);
			this.response.end("Hashtag not found");
		}

		if (HashtagsCollection.findOne({hashtag: hashtag}).privateKey !== privateKey) {
			this.response.writeHead(500);
			this.response.end("Missing permissions.");
		}

		Meteor.call("Main.killAll", hashtag);

		this.response.writeHead(200);
		this.response.end("Session successfully removed");
	});

Router.route('api/showReadingConfirmation', {where: 'server'})
	.post(function () {
		var sessionConfiguration = this.request.body.sessionConfiguration;
		var hashtag = decodeURIComponent(sessionConfiguration.hashtag);
		var privateKey = decodeURIComponent(sessionConfiguration.privateKey);

		if (!HashtagsCollection.findOne({hashtag: hashtag})) {
			this.response.writeHead(500);
			this.response.end("Hashtag not found");
		}

		if (HashtagsCollection.findOne({hashtag: hashtag}).privateKey !== privateKey) {
			this.response.writeHead(500);
			this.response.end("Missing permissions.");
		}

		Meteor.call("EventManagerCollection.showReadConfirmedForIndex", Router.current().params.quizName, EventManagerCollection.findOne().questionIndex + 1);

		this.response.writeHead(200);
	});

Router.route('/api/openSession', {where: 'server'})
	.post(function () {
		var sessionConfiguration = this.request.body.sessionConfiguration;
		var hashtag = decodeURIComponent(sessionConfiguration.hashtag);
		var privateKey = decodeURIComponent(sessionConfiguration.privateKey);

		if (!HashtagsCollection.findOne({hashtag: hashtag})) {
			this.response.writeHead(500);
			this.response.end("Hashtag not found");
		}

		if (HashtagsCollection.findOne({hashtag: hashtag}).privateKey !== privateKey) {
			this.response.writeHead(500);
			this.response.end("Missing permissions.");
		}

		var eventManagerCollectionEntry =  EventManagerCollection.findOne({hashtag: hashtag});

		if (!eventManagerCollectionEntry) {
			Meteor.call('EventManagerCollection.add', hashtag);
		}

		Meteor.call("EventManagerCollection.setSessionStatus", hashtag, 2);

		this.response.writeHead(200);
		this.response.end("Session status successfully set");
	});

Router.route('/api/startNextQuestion', {where: 'server'})
	.post(function () {
		var sessionConfiguration = this.request.body.sessionConfiguration;
		var hashtag = decodeURIComponent(sessionConfiguration.hashtag);
		var privateKey = decodeURIComponent(sessionConfiguration.privateKey);
		var questionIndex = sessionConfiguration.questionIndex;

		if (!HashtagsCollection.findOne({hashtag: hashtag})) {
			this.response.writeHead(500);
			this.response.end("Hashtag not found");
		}

		if (HashtagsCollection.findOne({hashtag: hashtag}).privateKey !== privateKey) {
			this.response.writeHead(500);
			this.response.end("Missing permissions.");
		}

		if (questionIndex === 0) {
			Meteor.call('EventManagerCollection.startQuiz', hashtag, questionIndex);
		} else {
			Meteor.call('Question.startTimer', {
				hashtag: hashtag,
				questionIndex: questionIndex
			});
			Meteor.call("EventManagerCollection.setActiveQuestion", hashtag, questionIndex);
		}

		this.response.writeHead(200);
		this.response.end("Next Question with index " + questionIndex + " started.");
	});

Router.route('/api/updateQuestionGroup', {where: 'server'})
	.post(function () {
		var questionGroupModel = this.request.body.questionGroupModel;
		var privateKey = this.request.body.privateKey;

		questionGroupModel.hashtag = decodeURIComponent(questionGroupModel.hashtag);
		questionGroupModel.configuration.hashtag = decodeURIComponent(questionGroupModel.configuration.hashtag);
		questionGroupModel.configuration.music.hashtag = decodeURIComponent(questionGroupModel.configuration.music.hashtag);
		questionGroupModel.configuration.nicks.hashtag = decodeURIComponent(questionGroupModel.configuration.nicks.hashtag);

		new SimpleSchema({hashtag: hashtagSchema}).validate({hashtag: questionGroupModel.hashtag});
		if (!HashtagsCollection.findOne({hashtag: questionGroupModel.hashtag})) {
			this.response.writeHead(500);
			this.response.end("Hashtag not found");
		}

		if (HashtagsCollection.findOne({hashtag: questionGroupModel.hashtag}).privateKey !== privateKey) {
			this.response.writeHead(500);
			this.response.end("Missing permission to edit this quiz.");
		}

		questionGroupSchema.validate({
			hashtag: questionGroupModel.hashtag,
			questionList: questionGroupModel.questionList
		});

		const sessionConfigObject = questionGroupModel.configuration;
		SessionConfigurationCollection.update({hashtag: sessionConfigObject.hashtag}, {$set: {
			hashtag: sessionConfigObject.hashtag,
			music: sessionConfigObject.music,
			nicks: sessionConfigObject.nicks,
			theme: sessionConfigObject.theme,
			showResponseProgress: sessionConfigObject.showResponseProgress,
			readingConfirmationEnabled: sessionConfigObject.readingConfirmationEnabled
		}}, {upsert: true});

		Meteor.call('SessionConfiguration.addConfig', sessionConfigObject);

		for (let i = 0; i < questionGroupModel.questionList.length; i++) {
			questionGroupModel.questionList[i].hashtag = decodeURIComponent(questionGroupModel.questionList[i].hashtag);
			questionGroupModel.questionList[i].questionText = decodeURIComponent(questionGroupModel.questionList[i].questionText);
			const qItem = questionGroupModel.questionList[i];
			if (qItem.answerOptionList !== null) {
				for (let j = 0; j < qItem.answerOptionList.length; j++) {
					if (qItem.answerOptionList[i] !== undefined) {
						qItem.answerOptionList[i].hashtag = questionGroupModel.hashtag;
						qItem.answerOptionList[i].answerText = decodeURIComponent(qItem.answerOptionList[i].answerText);
					}
				}
			}
		}

		Meteor.call("QuestionGroupCollection.persist", questionGroupModel);

		this.response.writeHead(200);
		this.response.end("Session with hashtag " + questionGroupModel.hashtag + " successfully updated");
	});
