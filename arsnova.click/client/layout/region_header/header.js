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
import { Hashtags } from '/lib/hashtags.js';
import * as localData from '/client/lib/local_storage.js';
import { buzzsound1 } from '/client/plugins/sound/scripts/lib.js';


Template.header.onCreated(function () {
    this.autorun(() => {
        if(!Session.get("hashtag")) {
            return;
        }

        this.subscribe('EventManager.join', Session.get("hashtag"), ()=>{
            var hashtagDocs = Hashtags.find();

            hashtagDocs.observe({
                changed: function (doc) {
                    if(doc.hashtag == Session.get("hashtag")){
                        if (doc.sessionStatus === 0 || doc.sessionStatus === 1) {
                            Router.go("/resetToHome");
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
    'click .kill-session-switch, click .arsnova-logo': function () {
        if (Session.get("isOwner")){
            buzzsound1.stop();
            Meteor.call("Main.killAll", localData.getPrivateKey(), Session.get("hashtag"));
            Router.go("/");
        } else {
            Router.go("/resetToHome");
        }
    },
    'click .sound-button': function () {
        $('#soundModal').modal({backdrop: 'static', keyboard: false});
    }
});