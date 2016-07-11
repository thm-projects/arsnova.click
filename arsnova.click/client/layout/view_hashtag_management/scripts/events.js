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
import {Template} from 'meteor/templating';
import {Tracker} from 'meteor/tracker';
import {Session} from 'meteor/session';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {TAPi18n} from 'meteor/tap:i18n';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {HashtagsCollection, hashtagSchema} from '/lib/hashtags/collection.js';
import {DefaultQuestionGroup} from "/lib/questions/questiongroup_default.js";
import * as localData from '/lib/local_storage.js';
import {Splashscreen, ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import * as lib from './lib.js';

Template.hashtagView.events({
	"input #hashtag-input-field": function (event) {
		var inputHashtag = $(event.target).val().trim();
		if (["?", "/", "\\"].some(function (v) { return inputHashtag.indexOf(v) >= 0; })) {
			$("#joinSession, #addNewHashtag").attr("disabled", "disabled");
			return;
		}
		if (lib.eventManagerHandle) {
			lib.eventManagerHandle.stop();
		}
		if (lib.eventManagerTracker) {
			lib.eventManagerTracker.stop();
		}
		lib.setEventManagerTracker(Tracker.autorun(function () {
			const originalHashtag = lib.findOriginalHashtag(inputHashtag);
			Meteor.subscribe("EventManagerCollection.join", originalHashtag, function () {
				if (!EventManagerCollection.findOne() || localData.containsHashtag(originalHashtag)) {
					$("#joinSession").attr("disabled", "disabled");
				}
				lib.setEventManagerHandle(EventManagerCollection.find({hashtag: originalHashtag}).observeChanges({
					changed: function (id, changedFields) {
						if (!isNaN(changedFields.sessionStatus)) {
							if (changedFields.sessionStatus === 2) {
								$("#joinSession").removeAttr("disabled");
							} else {
								$("#joinSession").attr("disabled", "disabled");
							}
						}
					},
					added: function (id, doc) {
						if (!isNaN(doc.sessionStatus)) {
							if (doc.sessionStatus === 2) {
								$("#joinSession").removeAttr("disabled");
							} else {
								$("#joinSession").attr("disabled", "disabled");
							}
						}
					}
				}));
			});
		}));
		let addNewHashtagItem = $("#addNewHashtag");
		addNewHashtagItem.html(TAPi18n.__("view.hashtag_management.create_session") + '<span class="glyphicon glyphicon-edit glyph-right" aria-hidden="true"></span>');
		if (lib.trimIllegalChars(inputHashtag).length === 0) {
			addNewHashtagItem.attr("disabled", "disabled");
			return;
		}

		const originalHashtag = lib.findOriginalHashtag(inputHashtag);

		var hashtagDoc = HashtagsCollection.findOne({hashtag: originalHashtag});
		if (!hashtagDoc) {
			$("#joinSession").attr("disabled", "disabled");
			addNewHashtagItem.removeAttr("disabled");
		} else {
			var localLoweredHashtags = localData.getAllLoweredHashtags();
			if ($.inArray(inputHashtag.toLowerCase(), localLoweredHashtags) > -1) {
				addNewHashtagItem.html(TAPi18n.__("view.hashtag_management.reenter_session") + '<span class="glyphicon glyphicon-log-in glyph-right" aria-hidden="true"></span>');
				addNewHashtagItem.removeAttr("disabled");
			} else {
				addNewHashtagItem.attr("disabled", "disabled");
			}
		}
	},
	"click #addNewHashtag": function () {
		const hashtag = $("#hashtag-input-field").val().trim();
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
			sessionStorage.setItem("overrideValidQuestionRedirect", true);
			const session = localData.reenterSession(hashtag);
			Session.set("questionGroup", session);
			lib.connectEventManager(localData.findHashtagCaseInsensitiveFromLocalStorage(hashtag));
		} else {
			const questionGroup = new DefaultQuestionGroup({
				hashtag: hashtag,
				questionList: []
			});
			questionGroup.addDefaultQuestion(0);
			for (let i = 0; i < 4; i++) {
				questionGroup.getQuestionList()[0].addDefaultAnswerOption(i);
			}
			Meteor.call('HashtagsCollection.addHashtag', {
				privateKey: localData.getPrivateKey(),
				hashtag: questionGroup.getHashtag(),
				musicVolume: 80,
				musicEnabled: 1,
				musicTitle: "Song1",
				theme: "theme-blackbeauty",
				selectedNicks: []
			}, function (err) {
				if (!err) {
					localData.addHashtag(questionGroup);
					Session.set("questionGroup", questionGroup);
					lib.connectEventManager(hashtag);
				}
			});
		}
	},
	"click #joinSession": function () {
		var hashtag = $("#hashtag-input-field").val().trim();
		var session = EventManagerCollection.findOne({hashtag: {'$regex': hashtag, $options: 'i'}});
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
		var keyWhiteList = [
			37,
			39,
			8,
			46,
			13
		]; //left, right, delete, entf
		var charCount = $(event.currentTarget).val().length;
		if (charCount >= 25 && keyWhiteList.indexOf(event.keyCode) == -1) {
			event.preventDefault();
		}

		//Select option on enter
		if (event.keyCode == 13) {
			var inputHashtag = $(event.target).val();
			if (inputHashtag.length === 0) {
				return;
			}

			var hashtagDoc = HashtagsCollection.findOne({hashtag: inputHashtag});
			if (!hashtagDoc) {
				//Add new Hashtag
				$("#addNewHashtag").click();
			} else {
				var localHashtags = localData.getAllHashtags();
				if ($.inArray(inputHashtag, localHashtags) > -1) {
					//Edit own Hashtag
					$("#addNewHashtag").click();
				} else if (EventManagerCollection.findOne() && EventManagerCollection.findOne().sessionStatus === 2) {
					//Join session
					$("#joinSession").click();
				}
			}
		}
	}
});

Template.hashtagManagement.events({
	"click #backButton": function () {
		Router.go("/");
	},
	"click .js-reactivate-hashtag": function (event) {
		var hashtag = $(event.currentTarget).parent().parent()[0].id;
		Session.set("questionGroup", localData.reenterSession(hashtag));
		lib.connectEventManager(hashtag);
	},
	"click .js-delete": function (event) {
		const hashtagRow = $(event.currentTarget).parent().parent();

		new Splashscreen({
			autostart: true,
			templateName: "deleteConfirmationSplashscreen",
			closeOnButton: "#closeDialogButton, #deleteSessionButton",
			onRendered: function (instance) {
				instance.templateSelector.find("#session_name").text(hashtagRow[0].id);

				instance.templateSelector.find("#deleteSessionButton").on('click', function () {
					localData.deleteHashtag(hashtagRow[0].id);
					Meteor.call('Main.deleteEverything', {
						hashtag: hashtagRow[0].id
					});
					hashtagRow.prev("hr").remove();
					hashtagRow.remove();
				});
			}
		});
	},
	"click .startQuiz": function (event) {
		var hashtag = $(event.currentTarget).parents(".hashtagManagementRow").attr("id");
		Session.set("questionGroup", localData.reenterSession(hashtag));
		sessionStorage.setItem("overrideValidQuestionRedirect", true);
		lib.connectEventManager(hashtag);
	}
});

Template.showHashtagsSplashscreen.events({
	"click .js-my-hash": function (event) {
		var hashtag = $(event.currentTarget).text();
		Session.set("questionGroup", localData.reenterSession(hashtag));
		lib.hashtagSplashscreen.destroy();
		sessionStorage.setItem("overrideValidQuestionRedirect", true);
		lib.connectEventManager(hashtag);
	},
	"click #js-btn-showHashtagManagement": function () {
		lib.hashtagSplashscreen.destroy();
		Router.go("/hashtagmanagement");
	},
	"click #closeButton": function () {
		$('.showHashtagsSplashscreen').remove();
		$('.modal-backdrop').remove();
	}
});
