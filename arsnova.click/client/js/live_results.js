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

var countdown = null;
Template.live_results.onCreated(function () {
    var oldStartTimeValues = {};
    countdown = null;

    this.autorun(() => {
        this.subscription = Meteor.subscribe('Responses.session', Session.get("hashtag"));
        this.subscription = Meteor.subscribe('AnswerOptions.options', Session.get("hashtag"));
        this.subscription = Meteor.subscribe('MemberList.members', Session.get("hashtag"));
        this.subscription = Meteor.subscribe('QuestionGroup.questionList', Session.get("hashtag"), function () {
            var doc = QuestionGroup.findOne();
            for(var i = 0; i< doc.questionList.length; i++) {
                oldStartTimeValues[i] = doc.questionList[i].startTime;
            }
            Session.set("oldStartTimeValues", oldStartTimeValues);
            if(!Session.get("sessionClosed") && Session.get("isOwner")) {
                startCountdown(0);
            }
        });
        this.subscription = Meteor.subscribe('Hashtags.public');
    });
});

Template.live_results.onDestroyed(function () {
    Session.set("countdownInitialized", undefined);
    Session.set("sessionCountDown", undefined);
    Session.set("sessionClosed", undefined);
    if(countdown) countdown.stop();
});

Template.live_results.onRendered(()=>{
    Tracker.autorun(()=>{
        var initializing = true;
        QuestionGroup.find().observeChanges({
            changed: function (id, changedFields) {
                if(!initializing && !Session.get("isOwner") && changedFields.questionList) {
                    var question = changedFields.questionList[Session.get("questionIndex")+1];
                    if (question.startTime && (Session.get("oldStartTimeValues")[Session.get("questionIndex")+1] !== question.startTime)) {
                        Session.set("questionIndex", Session.get("questionIndex") + 1);
                        Router.go("/onpolling");
                    }
                }
            }
        });
        initializing = false;
    });
});

Template.live_results.helpers({
    votingText: function () {
        return Session.get("sessionClosed") ? "Game over" : "Countdown";
    },
    isOwner: function () {
        return Session.get("isOwner");
    },
    getCountdown: function () {
        if (Session.get("countdownInitialized")){
            var roundedCountdown = Math.round(countdown.get());
            return roundedCountdown < 0 ? 0 : roundedCountdown;
        }
        return 0;
    },
    isCountdownZero: function () {
        if (Session.get("sessionClosed") || !Session.get("countdownInitialized")){
            return true;
        } else {
            var timer = Math.round(countdown.get());
            return timer <= 0;
        }
    },
    getCountStudents: function () {
        return MemberList.find().count();
    },
    sessionClosed: function () {
        return Session.get("sessionClosed");
    },
    showLeaderBoardButton: function () {
        return (AnswerOptions.find({questionIndex: Session.get("questionIndex"), isCorrect: 1}).count() > 0);
    },
    isMC: function(){
        return AnswerOptions.find({questionIndex: Session.get("questionIndex"), isCorrect: 1}).count() > 1;
    },
    mcOptions: function(){
        let memberAmount = Responses.find({questionIndex: Session.get("questionIndex")}).fetch();
        memberAmount = _.uniq(memberAmount, false, function(user) {return user.userNick;}).length;

        const correctAnswers = [];
        AnswerOptions.find({questionIndex: Session.get("questionIndex"), isCorrect:1},{fields:{"answerOptionNumber":1}}).forEach(function (answer){
            correctAnswers.push(answer.answerOptionNumber);
        });
        let allCorrect = 0;
        let allWrong = 0;
        MemberList.find().forEach(function(user){
            let responseAmount = 0;
            let everythingRight = true;
            let everythingWrong = true;
            Responses.find({questionIndex: Session.get("questionIndex"), userNick: user.nick}).forEach(function (response){
                if($.inArray(response.answerOptionNumber, correctAnswers) !== -1){
                    everythingWrong = false;
                }else{
                    everythingRight = false;
                }
                responseAmount++;
            });
            if(responseAmount){
                if(everythingRight && responseAmount === correctAnswers.length){
                    allCorrect++;
                }
                if(everythingWrong){
                    allWrong++;
                }
            }
        });
        return {
            allCorrect: {absolute: allCorrect, percent: memberAmount ? Math.floor((allCorrect * 100) / memberAmount) : 0},
            allWrong: {absolute: allWrong, percent: memberAmount ? Math.floor((allWrong * 100) / memberAmount) : 0}
        };
    },
    getNormalizedIndex: function (index) {
        return index + 1;
    },
    allQuestionCount: function () {
        var doc = QuestionGroup.findOne();
        return doc ? doc.questionList.length : false;
    },
    questionList: function () {
        var questionDoc = QuestionGroup.findOne();
        if(!questionDoc) return;

        var questionList = questionDoc.questionList;
        if(Session.get("questionIndex") < questionList.length - 1) {
            questionList.splice(Session.get("questionIndex") + 1, questionList.length - (Session.get("questionIndex") + 1));
        }
        return questionList ? questionList : false;
    },
    answerList: function (index) {
        var result = [];
        var memberAmount = Responses.find({questionIndex: index}).fetch();
        memberAmount = _.uniq(memberAmount, false, function(user) {return user.userNick;}).length;

        var correctAnswerOptions = AnswerOptions.find({questionIndex: index, isCorrect: 1}).count();
        AnswerOptions.find({questionIndex: index}, {sort:{'answerOptionNumber':1}}).forEach(function(value){
            var amount = Responses.find({questionIndex: index, answerOptionNumber: value.answerOptionNumber}).count();
            result.push({
                name: String.fromCharCode(value.answerOptionNumber + 65),
                absolute: amount,
                percent: memberAmount ? (Math.floor((amount * 100) / memberAmount)) : 0,
                isCorrect: correctAnswerOptions ? value.isCorrect : -1
            });
        });
        return result;
    },
    isActiveQuestion: function (index) {
        return !Session.get("sessionClosed") && index === Session.get("questionIndex");
    },
    isRunningQuestion: ()=>{
        return Session.get("countdownInitialized");
    },
    nextQuestionIndex: ()=>{
        var questionDoc = QuestionGroup.findOne();
        if(!questionDoc) return;

        if(Session.get("questionIndex") < questionDoc.questionList.length - 1) {
            return Session.get("questionIndex") + 2;
        }
    }
});

Template.live_results.events({
    "click #js-btn-showQuestionModal": function (event) {
        event.stopPropagation();
        $('.questionContentSplash').parents('.modal').modal();
        var questionDoc = QuestionGroup.findOne();
        var content = "";
        if (questionDoc) {
            mathjaxMarkdown.initializeMarkdownAndLatex();
            var questionText = questionDoc.questionList[Session.get("questionIndex")].questionText;
            content = mathjaxMarkdown.getContent(questionText);
        }

        $('#questionText').html(content);
    },
    "click #js-btn-showAnswerModal": function (event) {
        event.stopPropagation();
        mathjaxMarkdown.initializeMarkdownAndLatex();
        $('.answerTextSplash').parents('.modal').modal();
        var content = "";

        AnswerOptions.find({questionIndex: index}, {sort:{answerOptionNumber: 1}}).forEach(function (answerOption) {
            content += String.fromCharCode((answerOption.answerOptionNumber + 65)) + "<br/>";
            content += mathjaxMarkdown.getContent(answerOption.answerText) + "<br/>";
        });

        $('#answerOptionsTxt').html(content);
    },
    "click #js-btn-showLeaderBoard": function () {
        Router.go("/statistics");
    },
    "click #js-btn-export": function (event) {
        Meteor.call('Hashtags.export', {hashtag: Session.get("hashtag"), privateKey: localData.getPrivateKey()}, (err, res) => {
            if (err) {
                alert("Could not export!\n" + err);
            } else {
                var exportData = "text/json;charset=utf-8," + encodeURIComponent(res);
                var a = document.createElement('a');
                var time = new Date();
                var timestring = time.getDate() + "_" + (time.getMonth() + 1) + "_" + time.getFullYear();
                a.href = 'data:' + exportData;
                a.download = Session.get("hashtag") + "-" + timestring + ".json";
                a.innerHTML = '';
                event.target.appendChild(a);
                if (Session.get("exportReady")) {
                    Session.set("exportReady", undefined);
                }
                else {
                    Session.set("exportReady", true);
                    a.click();
                }
            }
        });
    },
    'click #startNextQuestion':()=>{
        var questionDoc = QuestionGroup.findOne();
        if(!questionDoc) return;

        var nextIndex = Session.get("questionIndex") + 1;
        if(nextIndex > questionDoc.questionList.length - 1) return;

        Session.set("questionIndex", nextIndex);
        Meteor.call('Question.startTimer', {
            privateKey: localData.getPrivateKey(),
            hashtag: Session.get("hashtag"),
            questionIndex: nextIndex
        }, (err, res) => {
            if (err) {
                $('.errorMessageSplash').parents('.modal').modal('show');
                $("#errorMessage-text").html(err.reason);
                Session.set("sessionClosed", true);
            } else {
                startCountdown(nextIndex);
            }
        });
    }
});

Template.result_button.onRendered(function () {
    $(window).resize(function () {
        if (AnswerOptions.find({questionIndex: Session.get("questionIndex"), isCorrect: 1}).count() > 1) {
            setMcCSSClasses();
        }
    });
    if (AnswerOptions.find({questionIndex: Session.get("questionIndex"), isCorrect: 1}).count() > 1) {
        setMcCSSClasses();
    }
});

Template.result_button.helpers({
    getCSSClassForIsCorrect: checkIfIsCorrect
});

Template.result_button_mc.helpers({
    getCSSClassForIsCorrect: checkIfIsCorrect
});

function checkIfIsCorrect(isCorrect){
    return isCorrect > 0 ? 'progress-success' : isCorrect < 0 ? 'progress-default' : 'progress-failure';
}

function startCountdown(index) {
    Session.set("questionIndex", index);
    var questionDoc = QuestionGroup.findOne().questionList[index];
    Session.set("sessionCountDown", questionDoc.timer);
    countdown = new ReactiveCountdown(questionDoc.timer / 1000);
    countdown.start(function () {
        Session.set("countdownInitialized", false);
        if(index + 1 >= QuestionGroup.findOne().questionList.length) {
            Session.set("sessionClosed", true);
        }
    });
    Session.set("countdownInitialized", true);
}

function setMcCSSClasses () {
    var windowWidth = $(window).width();

    for (var i = 0; i < 2; i++){
        var label = $("#mc_label"+i);
        var bar = $("#mc_bar"+i);
        label.removeClass();
        bar.removeClass();
        if (windowWidth < 361) {
            label.addClass("col-xs-6 col-sm-6 col-md-6");
            bar.addClass("col-xs-6 col-sm-6 col-md-6");
        }
        if (windowWidth > 360 && windowWidth < 431) {
            label.addClass("col-xs-5 col-sm-5 col-md-5");
            bar.addClass("col-xs-7 col-sm-7 col-md-7");
        }
        if (windowWidth > 430 && windowWidth < 576) {
            label.addClass("col-xs-4 col-sm-4 col-md-4");
            bar.addClass("col-xs-8 col-sm-8 col-md-8");
        }
        if (windowWidth > 575 && windowWidth < 851) {
            label.addClass("col-xs-3 col-sm-3 col-md-3");
            bar.addClass("col-xs-9 col-sm-9 col-md-9");
        }
        if (windowWidth > 850 && windowWidth < 992) {
            label.addClass("col-xs-2 col-sm-2 col-md-2");
            bar.addClass("col-xs-10 col-sm-10 col-md-10");
        }
        if (windowWidth > 991 && windowWidth < 1151) {
            label.addClass("col-xs-4 col-sm-4 col-md-4");
            bar.addClass("col-xs-8 col-sm-8 col-md-8");
        }
        if (windowWidth > 1150 && windowWidth < 1701) {
            label.addClass("col-xs-3 col-sm-3 col-md-3");
            bar.addClass("col-xs-9 col-sm-9 col-md-9");
        }
        if (windowWidth > 1700) {
            label.addClass("col-xs-2 col-sm-2 col-md-2");
            bar.addClass("col-xs-10 col-sm-10 col-md-10");
        }
    }
}