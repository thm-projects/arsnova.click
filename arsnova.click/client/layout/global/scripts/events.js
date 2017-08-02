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
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import {Tracker} from 'meteor/tracker';
import {Router} from 'meteor/iron:router';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {TAPi18n} from 'meteor/tap:i18n';
import {Splashscreen, ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {HashtagsCollection, hashtagSchema} from '/lib/hashtags/collection.js';
import {DefaultQuestionGroup} from "/lib/questions/questiongroup_default.js";
import {resetConnectionIndication, startConnectionIndication, getRTT, checkABCDOrdering} from './lib.js';
import * as hashtagLib from '/client/layout/view_hashtag_management/scripts/lib.js';
import * as localData from '/lib/local_storage.js';
import * as nickLib from "/client/layout/view_choose_nickname/scripts/lib.js";
import {DefaultAnswerOption} from "/lib/answeroptions/answeroption_default";

Template.connectionQualityHeader.events({
	"click #connectionQualityHeader": function () {
		new Splashscreen({
			autostart: true,
			templateName: "connectionQualitySplashscreen",
			closeOnButton: "#btn-hidePreviewModal, .splashscreen-container-close>.glyphicon-remove"
		});
		resetConnectionIndication();
		startConnectionIndication();
		getRTT();
	}
});

Template.home.events({
	"input #hashtag-input-field": function (event) {
		const inputTarget = $(event.target);
		const addNewHashtagItem = $("#addNewHashtag");
		const joinSessionItem = $("#joinSession");
		let inputHashtag = inputTarget.val().trim();
		let originalHashtag = hashtagLib.findOriginalHashtag(inputHashtag);
		const hashtagDoc = HashtagsCollection.findOne({hashtag: originalHashtag});

		inputTarget.popover("destroy");
		if (["?", "/", "\\", "#", "\"", "'"].some(function (v) {
				return inputHashtag.indexOf(v) >= 0;
			})) {
			$("#joinSession, #addNewHashtag").attr("disabled", "disabled");
			inputTarget.popover({
				title: TAPi18n.__("view.hashtag_view.hashtag_input.illegal_chars"),
				trigger: 'manual',
				placement: 'bottom'
			});
			inputTarget.popover("show");
			return;
		}
		if (inputHashtag.toLowerCase() === "demo quiz") {
			Session.set("isAddingQuizType", "demoquiz");
			inputHashtag = hashtagLib.getNewDemoQuizName();
		} else if (checkABCDOrdering(inputHashtag.toLowerCase())) {
			Session.set("isAddingQuizType", "abcd");
			inputHashtag = hashtagLib.getNewABCDQuizName();
		} else {
			Session.set("isAddingQuizType", undefined);
		}
		if (hashtagLib.eventManagerTracker) {
			hashtagLib.eventManagerTracker.stop();
		}
		if (hashtagLib.eventManagerHandle) {
			hashtagLib.eventManagerHandle.stop();
		}
		if (hashtagLib.eventManagerCollectionObserver) {
			hashtagLib.eventManagerCollectionObserver.stop();
		}
		if (inputHashtag === "") {
			$("#joinSession, #addNewHashtag").attr("disabled", "disabled");
			return;
		}
		if (originalHashtag === "") {
			Session.set("isEditingQuiz", false);
		} else {
			hashtagLib.setEventManagerTracker(Tracker.autorun(function () {
				hashtagLib.setEventManagerHandle(Meteor.subscribe("EventManagerCollection.join", originalHashtag, function () {
					if (!EventManagerCollection.findOne() || localData.containsHashtag(originalHashtag)) {
						joinSessionItem.attr("disabled", "disabled");
					}
					hashtagLib.setEventManagerCollectionObserver(EventManagerCollection.find({hashtag: originalHashtag}).observeChanges({
						changed: function (id, changedFields) {
							if (!isNaN(changedFields.sessionStatus)) {
								if (changedFields.sessionStatus === 2) {
									joinSessionItem.removeAttr("disabled");
									inputTarget.popover("destroy");
								} else {
									joinSessionItem.attr("disabled", "disabled");
									if (!!addNewHashtagItem.attr("disabled")) {
										inputTarget.popover({
											title: TAPi18n.__("view.hashtag_view.hashtag_input.already_exists"),
											trigger: 'manual',
											placement: 'bottom'
										});
										inputTarget.popover("show");
									}
								}
							}
						},
						added: function (id, doc) {
							if (!isNaN(doc.sessionStatus)) {
								if (Session.get("isAddingQuizType") === "demoquiz") {
									inputHashtag = hashtagLib.getNewDemoQuizName();
								} else if (Session.get("isAddingQuizType") === "abcd") {
									inputHashtag = hashtagLib.getNewABCDQuizName();
								}
								originalHashtag = hashtagLib.findOriginalHashtag(inputHashtag);
								if (doc.sessionStatus === 2) {
									joinSessionItem.removeAttr("disabled");
									inputTarget.popover("destroy");
								} else {
									joinSessionItem.attr("disabled", "disabled");
									if (!!addNewHashtagItem.attr("disabled")) {
										inputTarget.popover({
											title: TAPi18n.__("view.hashtag_view.hashtag_input.already_exists"),
											trigger: 'manual',
											placement: 'bottom'
										});
										inputTarget.popover("show");
									}
								}
							}
						},
						removed: function () {
							joinSessionItem.attr("disabled", "disabled");
						}
					}));
				}));
			}));
		}
		if (hashtagLib.trimIllegalChars(inputHashtag).length === 0) {
			addNewHashtagItem.attr("disabled", "disabled");
			return;
		}
		if (!hashtagDoc) {
			joinSessionItem.attr("disabled", "disabled");
			if (!Meteor.status().connected) {
				addNewHashtagItem.attr("disabled", "disabled");
				inputTarget.popover({
					title: TAPi18n.__("view.hashtag_view.hashtag_input.server_offline"),
					trigger: 'manual',
					placement: 'bottom'
				});
				inputTarget.popover("show");
			} else {
				addNewHashtagItem.removeAttr("disabled");
			}
		} else {
			const localLoweredHashtags = localData.getAllLoweredHashtags();
			if ($.inArray(inputHashtag.toLowerCase(), localLoweredHashtags) > -1) {
				Session.set("isEditingQuiz", true);
				addNewHashtagItem.removeAttr("disabled");
			} else {
				Session.set("isEditingQuiz", false);
				addNewHashtagItem.attr("disabled", "disabled");
			}
		}
	},
	"click #addNewHashtag": function () {
		const promise = new Promise(function (resolve, reject) {
			if (Meteor.settings.public.maximumActiveQuizzes) {
				const currentActiveQuizzes = EventManagerCollection.find({sessionStatus: {$gt: 1}}).fetch();
				if (currentActiveQuizzes < Meteor.settings.public.maximumActiveQuizzes) {
					const passwordPromise = new Promise(function (passwordResolve, passwordReject) {
						if (Meteor.settings.public.quizCreationPassword) {
							new Splashscreen({
								autostart: true,
								templateName: "quizCreationPasswordSplashscreen",
								closeOnButton: "#js-btn-close, #js-btn-validatePassword, .splashscreen-container-close>.glyphicon-remove",
								onRendered: function (template) {
									$(template.templateSelector).find('#js-btn-validatePassword').on('click', function () {
										if ($(template.templateSelector).find('#password').val() === Meteor.settings.public.quizCreationPassword) {
											passwordResolve();
										} else {
											passwordReject();
										}
									});
								}
							});
						} else {
							passwordResolve();
						}
					});
					passwordPromise.then(function () {
						if (Meteor.settings.public.restrictQuizmastersToCASUsers) {
							Meteor.loginWithCas(function () {
								nickLib.hasTHMMail() ? resolve() : reject("plugins.splashscreen.error.error_messages.invalid_login");
							});
						} else {
							resolve();
						}
					}, function () {
						new ErrorSplashscreen({
							autostart: true,
							errorMessage: "plugins.splashscreen.error.error_messages.invalid_password"
						});
					});
				} else {
					reject("plugins.splashscreen.error.error_messages.maximum_quizzes_exceeded");
				}
			} else {
				resolve();
			}
		});
		promise.then(function () {let hashtag = $("#hashtag-input-field").val().trim();
		if (hashtag.toLowerCase() === "demo quiz") {
			hashtag = hashtagLib.getNewDemoQuizName();
		}else if (checkABCDOrdering(hashtag.toLowerCase())) {
			hashtag = hashtagLib.getNewABCDQuizName();
		}
		try {
			new SimpleSchema({
				hashtag: hashtagSchema
			}).validate({hashtag: hashtag});
		} catch (ex) {
			new ErrorSplashscreen({
				autostart: true,
				errorMessage: "plugins.splashscreen.error.error_messages.invalid_input_data"
			});
			return;
		}
		const localLoweredHashtags = localData.getAllLoweredHashtags();
		if ($.inArray(hashtag.toLowerCase(), localLoweredHashtags) > -1 && HashtagsCollection.findOne()) {
			const session = localData.reenterSession(hashtag);
			Session.set("questionGroup", session);
			if (Session.get("questionGroup").isValid()) {
				sessionStorage.setItem("overrideValidQuestionRedirect", true);
			}
			hashtagLib.addHashtag(Session.get("questionGroup"));
		} else {
			let questionGroup = null;
			const successDemoQuizCallback = function (data) {
				questionGroup = new DefaultQuestionGroup(data);
				questionGroup.setHashtag(hashtag);
				if (questionGroup.isValid()) {
					sessionStorage.setItem("overrideValidQuestionRedirect", true);
				}
				localStorage.setItem("showProductTour", true);
				hashtagLib.addHashtag(questionGroup);
			};
			const successABCDQuizCallback = function (data) {
				questionGroup = new DefaultQuestionGroup(data);
				questionGroup.setHashtag(hashtag);
				questionGroup.getQuestionList()[0].removeAllAnswerOptions();
				for (let i = 0; i < $("#hashtag-input-field").val().trim().length; i++) {
					questionGroup.getQuestionList()[0].addAnswerOption(new DefaultAnswerOption({
						hashtag: questionGroup.getHashtag(),
						questionIndex: 0,
						answerText: "",
						answerOptionNumber: i,
						isCorrect: false
					}));
				}
				sessionStorage.setItem("overrideValidQuestionRedirect", true);
				hashtagLib.addHashtag(questionGroup);
			};
			if (hashtag.toLowerCase().indexOf("demo quiz") !== -1) {
				$.ajax({
					type: "GET",
					url: `/predefined_quizzes/demo_quiz/${TAPi18n.getLanguage()}.demo_quiz.json?_=${Date.now()}`,
					dataType: 'json',
					success: successDemoQuizCallback,
					error: function () {
						$.ajax({
							type: "GET",
							url: `/predefined_quizzes/demo_quiz/en.demo_quiz.json?_=${Date.now()}`,
							dataType: 'json',
							success: successDemoQuizCallback
						});
					}
				});
			} else if (checkABCDOrdering($("#hashtag-input-field").val().trim())) {
				$.ajax({
					type: "GET",
					url: `/predefined_quizzes/abcd_quiz/${TAPi18n.getLanguage()}.abcd_quiz.json?_=${Date.now()}`,
					dataType: 'json',
					success: successABCDQuizCallback,
					error: function () {
						$.ajax({
							type: "GET",
							url: `/predefined_quizzes/abcd_quiz/en.abcd_quiz.json?_=${Date.now()}`,
							dataType: 'json',
							success: successABCDQuizCallback
						});
					}
				});
			} else {
				questionGroup = new DefaultQuestionGroup({
					hashtag: hashtag
				});
				hashtagLib.addHashtag(questionGroup);
			}
		}}, function (rejectReason) {
			new ErrorSplashscreen({autostart: true, errorMessage: rejectReason});
		});
	},
	"click #joinSession": function () {
		const hashtag = $("#hashtag-input-field").val().trim();
		const session = EventManagerCollection.findOne({hashtag: {'$regex': hashtag, $options: 'i'}});
		if (session.sessionStatus === 2) {
			Router.go("/" + session.hashtag + "/nick");
		} else {
			$("#joinSession").attr("disabled", "disabled");
			new ErrorSplashscreen({
				autostart: true,
				errorMessage: "plugins.splashscreen.error.error_messages.session_not_available"
			});
		}
	},
	"keydown #hashtag-input-field": function (event) {
		const keyWhiteList = [
			37,
			39,
			8,
			46,
			13
		]; //left, right, delete, entf
		const charCount = $(event.currentTarget).val().length;
		if (charCount >= 26 && keyWhiteList.indexOf(event.keyCode) === -1) {
			event.preventDefault();
		}

		//Select option on enter
		if (event.keyCode === 13) {
			const inputHashtag = $(event.target).val();
			if (inputHashtag.length === 0) {
				return;
			}

			const addNewHashtagElement = $("#addNewHashtag");
			const joinSessionElement = $("#joinSession");
			if (!addNewHashtagElement.attr("disabled")) { // Add new Hashtag / edit own hashtag
				addNewHashtagElement.click();
			} else if (!joinSessionElement.attr("disabled")) { // Join existing session
				joinSessionElement.click();
			}
		}
	}
});
