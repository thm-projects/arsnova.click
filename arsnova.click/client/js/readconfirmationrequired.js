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

Template.readconfirmationrequired.onCreated(function () {
    this.autorun(() => {
        this.subscribe('Sessions.instructor', localData.getPrivateKey(), Session.get("hashtag"));
    });
});

Template.readconfirmationrequired.helpers({
    isReadConfirmationRequired:function () {

        var thisSession = Sessions.findOne({hashtag:Session.get("hashtag")});
        if (!thisSession) {
            return false;
        }
        return thisSession.isReadingConfirmationRequired;
    }
});

Template.readconfirmationrequired.events({
    "click #forwardButton": function () {
        localData.updateIsReadingConfirmationRequired(Session.get("hashtag"), Sessions.findOne({hashtag: Session.get("hashtag")}).isReadingConfirmationRequired);
        Meteor.call('Hashtags.setSessionStatus', localData.getPrivateKey(), Session.get("hashtag"), 2);
        Router.go("/memberlist");
    },
    "click #backButton": function () {
        if (Session.get("isOwner")){
            Router.go("/settimer");
        }else{
            Router.go("/nick");
        }
    },
    'click #isReadConfirmationRequiredButton': function (event) {
        event.preventDefault();

        var newVal = 0;
        var sessionDoc = Sessions.findOne({hashtag:Session.get("hashtag")});
        if (sessionDoc) {
            if (!sessionDoc.isReadingConfirmationRequired) {
                newVal = 1;
            }
        }
        Meteor.call("Sessions.updateIsReadConfirmationRequired", {
            privateKey: localData.getPrivateKey(),
            hashtag: Session.get("hashtag"),
            isReadingConfirmationRequired: newVal
        });

        var btn = $('#isReadConfirmationRequiredButton');
        btn.toggleClass("down");
        if(btn.hasClass("down")){
            btn.html("Lesebestätigung ist aktiv!");
        }else{
            btn.html("Lesebestätigung ist inaktiv!");
        }
    }
});