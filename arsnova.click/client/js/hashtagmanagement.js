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

Template.hashtagManagement.onCreated(function () {
    this.subscribe('Hashtags.public');
});

Template.hashtagManagement.onRendered(function () {
    $(window).resize(function () {
        labelManagement();
    });
    labelManagement();
});

Template.hashtagManagement.helpers({
    serverHashtags: function () {
        return localData.getAllHashtags();
    }
});

Template.hashtagManagement.events({
    "click .js-reactivate-hashtag": function (event) {
        var hashtag = $(event.currentTarget).parent().parent()[0].id;
        localData.reenterSession(hashtag);
        Session.set("isOwner", true);
        Session.set("hashtag", hashtag);
        Meteor.call('EventManager.add', localData.getPrivateKey(), hashtag, function(){
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
        Meteor.call('Main.deleteEverything', {privateKey: localData.getPrivateKey(), hashtag: hashtagRow[0].id});
        hashtagRow.hide();
    },
    "change #js-import": function (event) {
        var fileList = event.target.files;
        var fileReader = new FileReader();
        fileReader.onload = function () {
            var asJSON = JSON.parse(fileReader.result);
            Meteor.call("Hashtags.import",
                {
                    privateKey: localData.getPrivateKey(),
                    data: asJSON
                },
                (err) => {
                    if (err) {
                        $('.errorMessageSplash').parents('.modal').modal('show');
                        $("#errorMessage-text").html(err.reason);
                    }
                    else {
                        localData.importFromFile(asJSON);
                        Meteor.call("EventManager.setSessionStatus", localData.getPrivateKey(), asJSON.hashtagDoc.hashtag, 2,
                            (err) => {
                                if (err) {
                                    $('.errorMessageSplash').parents('.modal').modal('show');
                                    $("#errorMessage-text").html("Es ist ein Fehler bei der Aktualisierung deiner Frage aufgetreten.");
                                }
                                else {

                                }
                            }
                        );
                    }
                }
            );
        };
        for (var i = 0; i < fileList.length; i++) {
            fileReader.readAsBinaryString(fileList[i]);
        }
    }
});

function labelManagement () {
    var windowWidth = $(window).width();
    if (windowWidth < 1220 && windowWidth > 990) {
        $('.buttonLabels').hide();
    }
    else {
        $('.buttonLabels').show();
    }
}