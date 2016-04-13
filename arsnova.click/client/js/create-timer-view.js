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

let validationTrackerHandle = null;
var subscriptionHandler = null;
Template.createTimerView.onCreated(function () {
    Session.set("slider", 0);

    this.subscribe('AnswerOptions.instructor', localData.getPrivateKey(), Session.get("hashtag"));
    this.subscribe('QuestionGroup.authorizeAsOwner', localData.getPrivateKey(), Session.get("hashtag"));
    this.subscribe("EventManager.join",Session.get("hashtag"));

});

Template.createTimerView.onRendered(function () {
    createSlider();

    let index;
    subscriptionHandler = Tracker.autorun(()=> {
        if (this.subscriptionsReady()) {
            index = EventManager.findOne().questionIndex;
            subscriptionHandler.stop();
            setSlider(index);
        }
    });
    var body = $('body');
    body.on('click', '.questionIcon:not(.active)', function () {
        var currentSession = QuestionGroup.findOne();
        if (!currentSession || index >= currentSession.questionList.length) return;

        setTimer(index);
        index = EventManager.findOne().questionIndex;
        subscriptionHandler = Tracker.autorun(()=> {
            index = EventManager.findOne().questionIndex;
            subscriptionHandler.stop();
            setSlider(index);
        });
        setSlider(index);
    });
    body.on('click', '.removeQuestion', function () {
        index = EventManager.findOne().questionIndex;
    });

    validationTrackerHandle = Tracker.autorun(()=>{
        var valid_questions = Session.get("valid_questions");
        var forwardButton = $('#forwardButton');
        forwardButton.removeAttr("disabled");
        for(var i = 0; i < valid_questions.length; i++) {
            if( !valid_questions[i] ) {
                forwardButton.attr("disabled","disabled");
            }
        }
    });
});

Template.createTimerView.onDestroyed(function () {
    var body = $('body');
    body.off('click', '.questionIcon:not(.active)');
    body.off('click', '.removeQuestion');
    validationTrackerHandle.stop();
    subscriptionHandler.stop();
});


Template.createTimerView.helpers({
    slider: function () {
        return Session.get("slider");
    }
});

Template.createTimerView.events({
    "click #forwardButton, click #backButton":function(event){
        var err = setTimer(EventManager.findOne().questionIndex);

        if (err) {
            $('.errorMessageSplash').parents('.modal').modal('show');
            $("#errorMessage-text").html(err.reason);
        } else {
            if($(event.currentTarget).attr("id") === "forwardButton") {
                Meteor.call("MemberList.removeFromSession", localData.getPrivateKey(), Session.get("hashtag"));
                Meteor.call("EventManager.setActiveQuestion",localData.getPrivateKey(), Session.get("hashtag"), 0);
                Meteor.call("EventManager.setSessionStatus", localData.getPrivateKey(), Session.get("hashtag"), 2);
                Router.go("/memberlist");
            } else {
                Router.go("/answeroptions");
            }
        }
    }
});

function setTimer(index) {
    var hasError = false;
    // timer is given in seconds
    const timer = Session.get("slider") * 1000;
    if(!isNaN(timer)) {
        Meteor.call("Question.setTimer", {
            privateKey: localData.getPrivateKey(),
            hashtag: Session.get("hashtag"),
            questionIndex: index,
            timer: timer
        }, (err, res) => {
            if(err) {
                hasError = err;
            } else {
                localData.addTimer(Session.get("hashtag"), index, timer);
            }
        });
    } else {
        hasError = {
            reason: "Timer is not a number"
        };
    }
    return hasError;
}

function createSlider (index) {
    if (Session.get("slider") === undefined){
        setTimeout(createSlider, 50);
        return;
    }
    if (Session.get("slider") === 0){
        Session.set("slider", AnswerOptions.find({questionIndex: index}).count()*10);
    }
    this.$("#slider").noUiSlider({
        start: Session.get("slider"),
        range: {
            'min': 5,
            'max': 260
        }
    }).on('slide', function (ev, val) {
        Session.set('slider', Math.round(val));
    }).on('change', function (ev, val) {
        Session.set('slider', Math.round(val));
    });
}

function setSlider(index) {
    Session.set('slider', (QuestionGroup.findOne().questionList[index].timer / 1000));
    $("#slider").val((QuestionGroup.findOne().questionList[index].timer / 1000));
}