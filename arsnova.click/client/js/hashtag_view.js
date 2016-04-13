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

Template.hashtag_view.onCreated(function () {
    this.subscribe('Hashtags.public', ()=>{
        Hashtags.find().observeChanges({
            added: function (id, doc) {
                if (doc.hashtag === $("#hashtag-input-field").val()) {
                    $("#addNewHashtag").attr("disabled", "disabled");
                }
            }
        });
    });
    this.autorun(()=>{
        this.subscribe("EventManager.join",Session.get("hashtag"), ()=>{
            if( !EventManager.findOne({hashtag: Session.get("hashtag")}) ) {
                $("#joinSession").attr("disabled", "disabled");
                return;
            }
            EventManager.find().observeChanges({
                changed: function (id, changedFields) {
                    if(!isNaN(changedFields.sessionStatus)){
                        if(changedFields.sessionStatus === 2) {
                            $("#joinSession").removeAttr("disabled");
                        } else {
                            $("#joinSession").attr("disabled", "disabled");
                        }
                    }
                },
                added: function (id, doc) {
                    if(!isNaN(doc.sessionStatus)){
                        if(doc.sessionStatus === 2) {
                            $("#joinSession").removeAttr("disabled");
                        } else {
                            $("#joinSession").attr("disabled", "disabled");
                        }
                    }
                }
            });
        });
    });
});

Template.hashtag_view.onRendered(function () {

});

Template.hashtag_view.events({
    "input #hashtag-input-field": function (event) {
        var inputHashtag = $(event.target).val();
        Session.set("hashtag",inputHashtag);
        $("#addNewHashtag").html("Mach neu !<span class=\"glyphicon glyphicon-plus glyph-right\" aria-hidden=\"true\"></span>");
        if (inputHashtag.length === 0) {
            return;
        }

        var hashtagDoc = Hashtags.findOne({hashtag: inputHashtag});
        if (!hashtagDoc) {
            $("#joinSession").attr("disabled", "disabled");
            $("#addNewHashtag").removeAttr("disabled");
        } else {
            var localHashtags = localData.getAllHashtags();
            if ($.inArray(inputHashtag, localHashtags) > -1) {
                $("#addNewHashtag").html("Bearbeiten<span class=\"glyphicon glyphicon-pencil glyph-right\" aria-hidden=\"true\"></span>");
                $("#addNewHashtag").removeAttr("disabled");
            } else {
                $("#addNewHashtag").attr("disabled", "disabled");
            }
        }
    },
    "click #addNewHashtag": function (event) {
        event.preventDefault();
        if (!Session.get("localStorageAvailable")){
            $("#errorMessage-text").html("Im Privatmodus deines Browsers funktioniert arsnova.click leider nur als Teilnehmer, da dein Browser das Beschreiben des App-Speichers verweigert. Bitte für die Dauer der Nutzung von arsnova.click den Privatmodus deaktivieren und ARSnova erneut aufrufen. Deine Anonymität bleibt auch bei deaktiviertem Privatmodus gewahrt.");
            $("#errorMessage-text").parents('.errorMessageSplash').parents('.modal').modal('show');
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
                    Meteor.call('EventManager.add', localData.getPrivateKey(), hashtag, function(){
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
                Meteor.call('Hashtags.addHashtag', doc, (err, res) => {
                    if (err) {
                        $("#addNewHashtag").removeAttr("disabled");
                        $('.errorMessageSplash').parents('.modal').modal('show');
                        $("#errorMessage-text").html(err.reason);
                    } else {
                        for(var i=0; i < 4; i++) {
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
                            questionList: [{
                                questionText: "",
                                timer: 40000
                            }]
                        });

                        Session.set("hashtag", hashtag);
                        Session.set("isOwner", true);
                        localData.addHashtag(hashtag);
                        Meteor.call('EventManager.add', localData.getPrivateKey(), hashtag, function(){
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
            $('.errorMessageSplash').parents('.modal').modal('show');
            $("#errorMessage-text").html("Session is currently not available for joining");
        }
    },
    "keydown #hashtag-input-field": function (event) {
        var keyWhiteList = [37,39,8,46,13]; //left, right, delete, entf
        var charCount = $(event.currentTarget).val().length;
        if (charCount >= 25 && keyWhiteList.indexOf(event.keyCode)==-1) {
            event.preventDefault();
        }

        //Select option on enter
        if(event.keyCode == 13){
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