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
import {TAPi18n} from 'meteor/tap:i18n';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {HashtagsCollection} from '/lib/hashtags/collection.js';
import * as localData from '/lib/local_storage.js';
import {ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import * as lib from './lib.js';

function connectEventManager(hashtag) {
	Meteor.subscribe("EventManagerCollection.join", hashtag, function () {
		if (!EventManagerCollection.findOne()) {
			Meteor.call('EventManagerCollection.add', hashtag, function (err) {
				if (err) {
					new ErrorSplashscreen({
						autostart: true,
						errorMessage: TAPi18n.__("plugins.splashscreen.error.error_messages." + err.reason)
					});
					Router.go("/" + hashtag + "/resetToHome");
				} else {
					Router.go("/" + hashtag + "/question");
				}
			});
		}
		Router.go("/" + hashtag + "/question");
	});
}

Template.hashtagView.events({
	"input #hashtag-input-field": function (event) {
		var inputHashtag = $(event.target).val();
		if (lib.eventManagerHandle) {
			lib.eventManagerHandle.stop();
		}
		if (lib.eventManagerTracker) {
			lib.eventManagerTracker.stop();
		}
		lib.setEventManagerTracker(Tracker.autorun(function () {
			Meteor.subscribe("EventManagerCollection.join", $("#hashtag-input-field").val(), function () {
				if (!EventManagerCollection.findOne() || localData.containsHashtag($("#hashtag-input-field").val())) {
					$("#joinSession").attr("disabled", "disabled");
				}
				lib.setEventManagerHandle(EventManagerCollection.find({hashtag: $("#hashtag-input-field").val()}).observeChanges({
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
		addNewHashtagItem.html(TAPi18n.__("view.hashtag_management.create_session") + '<span class="glyphicon glyphicon-plus glyph-right" aria-hidden="true"></span>');
		if (inputHashtag.length === 0) {
			addNewHashtagItem.attr("disabled", "disabled");
			return;
		}

		var hashtagDoc = HashtagsCollection.findOne({hashtag: inputHashtag});
		if (!hashtagDoc) {
			$("#joinSession").attr("disabled", "disabled");
			addNewHashtagItem.removeAttr("disabled");
		} else {
			var localHashtags = localData.getAllHashtags();
			if ($.inArray(inputHashtag, localHashtags) > -1) {
				addNewHashtagItem.html(TAPi18n.__("view.hashtag_management.reenter_session") + '<span class="glyphicon glyphicon-log-in glyph-right" aria-hidden="true"></span>');
				addNewHashtagItem.removeAttr("disabled");
			} else {
				addNewHashtagItem.attr("disabled", "disabled");
			}
		}
	},
	"click #addNewHashtag": function () {
		if (!localStorage.getItem("localStorageAvailable")) {
			new ErrorSplashscreen({
				autostart: true,
				errorMessage: TAPi18n.__("plugins.splashscreen.error.error_messages.private_browsing")
			});
			return;
		}
		var hashtag = $("#hashtag-input-field").val().trim();
		hashtag = hashtag.replace(/ /g,"_");
		var reenter = false;
		if (hashtag.length > 0) {
			var localHashtags = localData.getAllHashtags();
			if ($.inArray(hashtag, localHashtags) > -1) {
				var oldHashtagDoc = HashtagsCollection.findOne();
				if (oldHashtagDoc) {
					reenter = true;
					sessionStorage.setItem("overrideValidQuestionRedirect", true);
					localData.reenterSession(hashtag);
					connectEventManager(hashtag);
				}
			}
			if (!reenter) {
				var doc = {
					privateKey: localData.getPrivateKey(),
					hashtag: hashtag,
					musicVolume: 80,
					musicEnabled: 1,
					musicTitle: "Song1"
				};
				Meteor.call('HashtagsCollection.addHashtag', doc, (err) => {
					if (err) {
						$("#addNewHashtag").removeAttr("disabled");
						new ErrorSplashscreen({
							autostart: true,
							errorMessage: TAPi18n.__("plugins.splashscreen.error.error_messages." + err.reason)
						});
					} else {
						for (var i = 0; i < 4; i++) {
							Meteor.call("AnswerOptionCollection.addOption", {
								hashtag: hashtag,
								questionIndex: 0,
								answerText: "",
								answerOptionNumber: i,
								isCorrect: 0
							});
						}
						Meteor.call("QuestionGroupCollection.insert", {
							hashtag: hashtag,
							questionList: [
								{
									questionText: "",
									timer: 40000
								}
							]
						});

						localData.addHashtag(hashtag);
						connectEventManager(hashtag);
					}
				});
			}
		}
	},
	"click #joinSession": function () {
		var hashtag = $("#hashtag-input-field").val();

		if (EventManagerCollection.findOne().sessionStatus === 2) {
			Router.go("/" + hashtag + "/nick");
		} else {
			$("#joinSession").attr("disabled", "disabled");
			new ErrorSplashscreen({
				autostart: true,
				errorMessage: TAPi18n.__("plugins.splashscreen.error.error_messages.session_not_available")
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
		localData.reenterSession(hashtag);
		connectEventManager(hashtag);
	},
	"click .js-export": function (event) {
		var hashtag = $(event.currentTarget).parent().parent()[0].id;
		var exportData = localData.exportFromLocalStorage(hashtag);
		if (exportData) {
			var exportDataJson = "text/json;charset=utf-8," + encodeURIComponent(exportData);
			var a = document.createElement('a');
			var time = new Date();
			var timestring = time.getDate() + "_" + (time.getMonth() + 1) + "_" + time.getFullYear();
			a.href = 'data:' + exportDataJson;
			a.download = hashtag + "-" + timestring + ".json";
			a.innerHTML = '';
			event.target.appendChild(a);
			if (localStorage.getItem(Router.current().params.quizName + "exportReady")) {
				localStorage.setItem(Router.current().params.quizName + "exportReady", undefined);
			} else {
				localStorage.setItem(Router.current().params.quizName + "exportReady", true);
				a.click();
			}
		}
	},
	"click .js-delete": function (event) {
		var hashtagRow = $(event.currentTarget).parent().parent();
		localData.deleteHashtag(hashtagRow[0].id);
		Meteor.call('Main.deleteEverything', {
			hashtag: hashtagRow[0].id
		});
		hashtagRow.hide();
	},
	"change #js-import": function (event) {
		var fileList = event.target.files;
		var fileReader = new FileReader();
		fileReader.onload = function () {
			var asJSON = JSON.parse(fileReader.result);
			Meteor.call("HashtagsCollection.import", {
				data: asJSON
			}, (err) => {
				if (err) {
					new ErrorSplashscreen({
						autostart: true,
						errorMessage: TAPi18n.__("plugins.splashscreen.error.error_messages." + err.reason)
					});
				} else {
					localData.importFromFile(asJSON);
					connectEventManager(asJSON.hashtagDoc.hashtag);
				}
			});
		};
		for (var i = 0; i < fileList.length; i++) {
			fileReader.readAsBinaryString(fileList[i]);
		}
	}
});

Template.showHashtagsSplashscreen.events({
	"click .js-my-hash": function (event) {
		var hashtag = $(event.currentTarget).text();
		localData.reenterSession(hashtag);
		lib.hashtagSplashscreen.destroy();
		sessionStorage.setItem("overrideValidQuestionRedirect", true);
		connectEventManager(hashtag);
	},
	"click #js-btn-showHashtagManagement": function () {
		lib.hashtagSplashscreen.destroy();
		Router.go("/hashtagmanagement");
	}
});
