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

Template.createTimerView.onCreated(function () {
    this.autorun(() => {
        this.subscription = Meteor.subscribe('AnswerOptions.instructor', localData.getPrivateKey(), Session.get("hashtag"), function() {});
        this.subscription = Meteor.subscribe('Sessions.instructor', localData.getPrivateKey(), Session.get("hashtag"), function () {
        var sessionDoc = Sessions.findOne({hashtag: Session.get("hashtag")});
        if (sessionDoc && sessionDoc.timer != 0) {
            Session.set("slider", (sessionDoc.timer / 1000));
        }else {
            Session.set("slider", 0);
        }
    });
});
});

Template.createTimerView.rendered = function () {
    createSlider();
};

function createSlider (defaultSec) {
    if (Session.get("slider") == undefined){
        setTimeout(createSlider, 50);
        return;
    }
    if (Session.get("slider") == 0){
        Session.set("slider", AnswerOptions.find({hashtag: Session.get("hashtag")}).count()*10);
    }
    this.$("#slider").noUiSlider({
        start: Session.get("slider"),
        range: {
            'min': 6,
            'max': 260
        }
    }).on('slide', function (ev, val) {
        Session.set('slider', Math.round(val));
    }).on('change', function (ev, val) {
        Session.set('slider', Math.round(val));
    });
}

Template.createTimerView.helpers({
    slider: function () {
        return Session.get("slider");
    }
});

Template.createTimerView.events({
    "click #forwardButton":function(){
        // timer is given in seconds
        const timer = Session.get("slider") * 1000;
        Meteor.call("Sessions.setTimer", {
            privateKey:localData.getPrivateKey(),
            hashtag:Session.get("hashtag"),
            timer:timer
        }, (err, res) => {
            if (err) {
                $('.errorMessageSplash').parents('.modal').modal('show');
                $("#errorMessage-text").html(err.reason);
            } else {
                localData.addTimer(Session.get("hashtag"), timer);
        Router.go("/readconfirmationrequired");
    }
    });
    },
    "click #backButton":function(){
        const timer = Session.get("slider") * 1000;
        if(!isNaN(timer) && timer > 0) {
            Meteor.call("Sessions.setTimer", {
                privateKey:localData.getPrivateKey(),
                hashtag:Session.get("hashtag"),
                timer:timer
            }, (err, res) => {
                if (err) {
                    $('.errorMessageSplash').parents('.modal').modal('show');
                    $("#errorMessage-text").html(err.reason);
                } else {
                    localData.addTimer(Session.get("hashtag"), timer);
            Router.go("/answeroptions");
        }
        });
        }
    }
});