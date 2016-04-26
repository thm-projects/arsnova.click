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
 * along with ARSnova Click.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { EventManager } from '/lib/eventmanager.js';
import { Hashtags } from '/lib/hashtags.js';
import * as localData from '/client/lib/local_storage.js';
import { splashscreen_error } from '/client/plugins/splashscreen/scripts/lib.js';
import * as lib from './lib.js';

Template.hashtag_view.events({
    "input #hashtag-input-field": function (event) {
        var inputHashtag = $(event.target).val();
        let addNewHashtagItem = $("#addNewHashtag");
        Session.set("hashtag", inputHashtag);
        addNewHashtagItem.html(TAPi18n.__("view.hashtag_management.create_session") + '<span class="glyphicon glyphicon-plus glyph-right" aria-hidden="true"></span>');
        if (inputHashtag.length === 0) {
            return;
        }

        var hashtagDoc = Hashtags.findOne({hashtag: inputHashtag});
        if (!hashtagDoc) {
            $("#joinSession").attr("disabled", "disabled");
            addNewHashtagItem.removeAttr("disabled");
        } else {
            var localHashtags = localData.getAllHashtags();
            if ($.inArray(inputHashtag, localHashtags) > -1) {
                addNewHashtagItem.html(TAPi18n.__("view.hashtag_management.edit_session") + '<span class="glyphicon glyphicon-pencil glyph-right" aria-hidden="true"></span>');
                addNewHashtagItem.removeAttr("disabled");
            } else {
                addNewHashtagItem.attr("disabled", "disabled");
            }
        }
    },
    "click #addNewHashtag": function () {
        if (!Session.get("localStorageAvailable")) {
            splashscreen_error.setErrorText(TAPi18n.__("plugins.splashscreen.error.error_messages.private_browsing"));
            splashscreen_error.open();
            return;
        }
        var hashtag = $("#hashtag-input-field").val();
        var reenter = false;
        if (hashtag.length > 0) {
            var localHashtags = localData.getAllHashtags();
            if ($.inArray(hashtag, localHashtags) > -1) {
                var oldHashtagDoc = Hashtags.findOne({hashtag: hashtag});
                if (oldHashtagDoc) {
                    reenter = true;
                    Session.set("hashtag", hashtag);
                    Session.set("isOwner", true);
                    localData.reenterSession(hashtag);
                    Meteor.call('EventManager.add', localData.getPrivateKey(), hashtag, function () {
                        Router.go("/question");
                    });
                }
            }
            if (!reenter) {
                var doc = {
                    privateKey: localData.getPrivateKey(),
                    hashtag: hashtag,
                    sessionStatus: 1,
                    lastConnection: (new Date()).getTime()
                };
                Meteor.call('Hashtags.addHashtag', doc, (err) => {
                    if (err) {
                        $("#addNewHashtag").removeAttr("disabled");
                        splashscreen_error.setErrorText(TAPi18n.__("plugins.splashscreen.error.error_messages."+err.reason));
                        splashscreen_error.open();
                    } else {
                        for (var i = 0; i < 4; i++) {
                            Meteor.call("AnswerOptions.addOption", {
                                privateKey: localData.getPrivateKey(),
                                hashtag: hashtag,
                                questionIndex: 0,
                                answerText: "",
                                answerOptionNumber: i,
                                isCorrect: 0
                            });
                        }
                        Meteor.call("QuestionGroup.insert", {
                            privateKey: localData.getPrivateKey(),
                            hashtag: hashtag,
                            questionList: [
                                {
                                    questionText: "",
                                    timer: 40000
                                }
                            ]
                        });

                        Session.set("hashtag", hashtag);
                        Session.set("isOwner", true);
                        localData.addHashtag(hashtag);
                        Meteor.call('EventManager.add', localData.getPrivateKey(), hashtag, function () {
                            Router.go("/question");
                        });
                    }
                });
            }
        }
    },
    "click #joinSession": function () {
        var hashtag = $("#hashtag-input-field").val();

        if (EventManager.findOne().sessionStatus === 2) {
            Session.set("hashtag", hashtag);
            Router.go("/nick");
        } else {
            $("#joinSession").attr("disabled", "disabled");
            splashscreen_error.setErrorText(TAPi18n.__("plugins.splashscreen.error.error_messages.session_not_available"));
            splashscreen_error.open();
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

            var hashtagDoc = Hashtags.findOne({hashtag: inputHashtag});
            if (!hashtagDoc) {
                //Add new Hashtag
                $("#addNewHashtag").click();
            } else {
                var localHashtags = localData.getAllHashtags();
                if ($.inArray(inputHashtag, localHashtags) > -1) {
                    //Edit own Hashtag
                    $("#addNewHashtag").click();
                } else if (EventManager.findOne() && EventManager.findOne().sessionStatus === 2) {
                    //Join session
                    $("#joinSession").click();
                }
            }
        }
    }
});

Template.hashtagManagement.events({
    "click .js-reactivate-hashtag": function (event) {
        var hashtag = $(event.currentTarget).parent().parent()[0].id;
        localData.reenterSession(hashtag);
        Session.set("isOwner", true);
        Session.set("hashtag", hashtag);
        Meteor.call('EventManager.add', localData.getPrivateKey(), hashtag, function () {
            Session.set("overrideValidQuestionRedirect", true);
            Router.go("/question");
        });
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
            if (Session.get("exportReady")) {
                Session.set("exportReady", undefined);
            } else {
                Session.set("exportReady", true);
                a.click();
            }
        }
    },
    "click .js-delete": function (event) {
        var hashtagRow = $(event.currentTarget).parent().parent();
        localData.deleteHashtag(hashtagRow[0].id);
        Meteor.call('Main.deleteEverything', {
            privateKey: localData.getPrivateKey(),
            hashtag: hashtagRow[0].id
        });
        hashtagRow.hide();
    },
    "change #js-import": function (event) {
        var fileList = event.target.files;
        var fileReader = new FileReader();
        fileReader.onload = function () {
            var asJSON = JSON.parse(fileReader.result);
            Meteor.call("Hashtags.import", {
                privateKey: localData.getPrivateKey(),
                data: asJSON
            }, (err) => {
                if (err) {
                    splashscreen_error.setErrorText(TAPi18n.__("plugins.splashscreen.error.error_messages."+err.reason));
                    splashscreen_error.open();
                } else {
                    localData.importFromFile(asJSON);
                    Meteor.call('EventManager.add', localData.getPrivateKey(), asJSON.hashtagDoc.hashtag, function () {
                        Meteor.call("EventManager.setSessionStatus", localData.getPrivateKey(), asJSON.hashtagDoc.hashtag, 2, (err) => {
                            if (err) {
                                splashscreen_error.setErrorText(TAPi18n.__("plugins.splashscreen.error.error_messages.update_failed"));
                                splashscreen_error.open();
                            } else {
                                Session.set("hashtag", asJSON.hashtagDoc.hashtag);
                                Session.set("isOwner", true);
                                Router.go("/question");
                            }
                        });
                    });
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
        Session.set("isOwner", true);
        Session.set("hashtag", hashtag);
        localData.reenterSession(hashtag);
        Meteor.call('EventManager.add', localData.getPrivateKey(), hashtag, function () {
            lib.hashtagSplashscreen.destroy();
            Router.go('/question');
        });
    },
    "click #js-btn-showHashtagManagement": function () {
        lib.hashtagSplashscreen.destroy();
        Router.go('/hashtagmanagement');
    }
});