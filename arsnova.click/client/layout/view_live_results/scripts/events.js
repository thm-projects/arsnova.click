import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { EventManager } from '/lib/eventmanager.js';
import { AnswerOptions } from '/lib/answeroptions.js';
import { MemberList } from '/lib/memberlist.js';
import { QuestionGroup } from '/lib/questions.js';
import { mathjaxMarkdown } from '/client/lib/mathjax_markdown.js';
import * as localData from '/client/lib/local_storage.js';
import { calculateButtonCount, startCountdown } from './lib.js';

Template.questionT.events({
    "click #setReadConfirmed": function () {
        Meteor.call("MemberList.setReadConfirmed", {
            hashtag: Session.get("hashtag"),
            questionIndex: EventManager.findOne().readingConfirmationIndex,
            nick: Session.get("nick")
        }, (err)=> {
            if (err) {
                $('.errorMessageSplash').parents('.modal').modal('show');
                $("#errorMessage-text").html(err.reason);
            } else {
                closeSplashscreen();
            }
        });
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
            var targetId = parseInt($(event.currentTarget).parents(".question-row").attr("id").replace("question-row_", ""));
            var questionText = questionDoc.questionList[targetId].questionText;
            content = mathjaxMarkdown.getContent(questionText);
        }

        $('#questionText').html(content);
    },
    "click #js-btn-showAnswerModal": function (event) {
        event.stopPropagation();
        mathjaxMarkdown.initializeMarkdownAndLatex();
        $('.answerTextSplash').parents('.modal').modal();
        var content = "";
        var targetId = parseInt($(event.currentTarget).parents(".question-row").attr("id").replace("question-row_", ""));

        AnswerOptions.find({questionIndex: targetId}, {sort: {answerOptionNumber: 1}}).forEach(function (answerOption) {
            if (!answerOption.answerText) {
                answerOption.answerText = "";
            }

            content += String.fromCharCode((answerOption.answerOptionNumber + 65)) + "<br/>";
            content += mathjaxMarkdown.getContent(answerOption.answerText) + "<br/>";
        });

        $('#answerOptionsTxt').html(content);
    },
    'click #js-btn-showQuestionAndAnswerModal': function (event) {
        event.stopPropagation();
        var questionDoc = QuestionGroup.findOne();
        if (!questionDoc) {
            return;
        }

        var targetId = parseInt($(event.currentTarget).parents(".question-row").attr("id").replace("question-row_", ""));
        var content = "";
        mathjaxMarkdown.initializeMarkdownAndLatex();

        let hasEmptyAnswers = true;

        AnswerOptions.find({questionIndex: targetId}, {sort: {answerOptionNumber: 1}}).forEach(function (answerOption) {
            if (!answerOption.answerText) {
                answerOption.answerText = "";
            } else {
                hasEmptyAnswers = false;
            }

            content += String.fromCharCode((answerOption.answerOptionNumber + 65)) + "<br/>";
            content += mathjaxMarkdown.getContent(answerOption.answerText) + "<br/>";
        });

        if (hasEmptyAnswers) {
            content = "";
            $('#answerOptionsHeader').hide();
        }

        $('.questionAndAnswerTextSplash').parents('.modal').modal("show");
        $('.questionAndAnswerTextSplash>#questionText').html(mathjaxMarkdown.getContent(questionDoc.questionList[targetId].questionText));
        $('.questionAndAnswerTextSplash>#answerOptionsTxt').html(content);
    },
    "click .btn-showLeaderBoard": function (event) {
        event.stopPropagation();
        var targetId = parseInt($(event.currentTarget).attr("id").replace("js-btn-showLeaderBoard_", ""));
        Session.set("showLeaderBoardId", targetId);
        Router.go("/statistics");
    },
    "click #js-btn-export": function (event) {
        event.stopPropagation();
        Meteor.call('Hashtags.export', {
            hashtag: Session.get("hashtag"),
            privateKey: localData.getPrivateKey()
        }, (err, res) => {
            if (err) {
                $('.errorMessageSplash').parents('.modal').modal('show');
                $("#errorMessage-text").html("Could not export!\n" + err.reason);
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
                } else {
                    Session.set("exportReady", true);
                    a.click();
                }
            }
        });
    },
    'click #backButton': (event)=> {
        event.stopPropagation();
        $('.sound-button').show();
        Meteor.call('Responses.clearAll', localData.getPrivateKey(), Session.get("hashtag"));
        Meteor.call("MemberList.clearReadConfirmed", localData.getPrivateKey(), Session.get("hashtag"));
        Meteor.call("EventManager.setSessionStatus", localData.getPrivateKey(), Session.get("hashtag"), 2);
    },
    'click #startNextQuestion': (event)=> {
        event.stopPropagation();
        var questionDoc = QuestionGroup.findOne();
        if (!questionDoc) {
            return;
        }

        Meteor.call('Question.startTimer', {
            privateKey: localData.getPrivateKey(),
            hashtag: Session.get("hashtag"),
            questionIndex: EventManager.findOne().questionIndex + 1
        }, (err) => {
            if (err) {
                $('.errorMessageSplash').parents('.modal').modal('show');
                $("#errorMessage-text").html(err.reason);
                Session.set("sessionClosed", true);
            } else {
                Meteor.call("EventManager.setActiveQuestion", localData.getPrivateKey(), Session.get("hashtag"), EventManager.findOne().questionIndex + 1, ()=> {
                    startCountdown(EventManager.findOne().questionIndex);
                });
            }
        });
    },
    'click #goGlobalRanking': (event)=> {
        event.stopPropagation();
        Session.set("showLeaderBoardId", undefined);
        Router.go("/statistics");
    },
    'click #showNextQuestionDialog': (event)=> {
        event.stopPropagation();
        Meteor.call("EventManager.showReadConfirmedForIndex", localData.getPrivateKey(), Session.get("hashtag"), EventManager.findOne().questionIndex + 1);
    },
    "click .btn-more-learners": function () {
        Session.set("LearnerCount", MemberList.find().count());
        Session.set("LearnerCountOverride", true);
    },
    'click .btn-less-learners': function () {
        Session.set("LearnerCountOverride", false);
        calculateButtonCount();
    },
    'click .btn-learner': function (event) {
        event.preventDefault();
    }
});