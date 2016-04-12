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

Template.header.onCreated(function () {
    this.autorun(() => {
        this.subscribe('EventManager.join', Session.get("hashtag"), ()=>{
            var hashtagDocs = Hashtags.find();

            hashtagDocs.observe({
                changed: function (doc, atIndex) {
                    if(doc.hashtag == Session.get("hashtag")){
                        if ((doc.sessionStatus === 0) || ((doc.sessionStatus === 1) && (!Session.get("isOwner")))) {
                            if (Session.get("isOwner")){
                                Router.go("/");
                            }else{
                                Router.go("/resetToHome");
                            }
                        }
                    }
                }
            });
        });
    });
});

Template.header.helpers({
    isInHomePathOrIsStudent: function () {
        switch (Router.current().route.path()) {
            case '/':
            case '/ueber':
            case '/agb':
            case '/datenschutz':
            case '/impressum':
                return true;
        }
        return !Session.get("isOwner");
    },
    currentHashtag: function () {
        return Session.get("hashtag");
    },
    isEditingQuestion: function () {
        switch (Router.current().route.path()) {
            case '/question':
            case '/answeroptions':
            case '/settimer':
            case '/readconfirmationrequired':
                return true;
            default:
                return false;
        }
    }
});

Template.header.events({
    'click .kill-session-switch': function () {
        if (Session.get("isOwner")){
            Meteor.call("Main.killAll", localData.getPrivateKey(), Session.get("hashtag"));
            Router.go("/");
        }
    }
});