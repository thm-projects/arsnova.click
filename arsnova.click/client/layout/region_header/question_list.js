import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { TAPi18n } from 'meteor/tap:i18n';
import { EventManager } from '/lib/eventmanager.js';
import { QuestionGroup } from '/lib/questions.js';
import { splashscreen_error } from '/client/plugins/splashscreen/scripts/lib.js';
import * as questionLib from '/client/layout/view_questions/scripts/lib.js';
import * as localData from '/client/lib/local_storage.js';
import * as lib from './lib.js';

var redirectTracker = null;

Template.questionList.onCreated(function () {
    Session.set("valid_questions",[]);

    this.subscribe("EventManager.join",Session.get("hashtag"));
    this.subscribe('QuestionGroup.questionList', Session.get("hashtag"));
    this.subscribe('AnswerOptions.instructor', localData.getPrivateKey(), Session.get("hashtag"));

    this.autorun(() => {
        if(this.subscriptionsReady()) {
            if (!QuestionGroup.findOne()) {
                return;
            }

            var questionList = QuestionGroup.findOne().questionList;
            var valid_questions = Session.get("valid_questions");
            if(questionList.length >= valid_questions.length) {
                return;
            }

            valid_questions.splice(questionList.length - 1, valid_questions.length - questionList.length);

            Session.set("valid_questions",valid_questions);
        }
    });
});

Template.questionList.onDestroyed(function () {
    redirectTracker.stop();
});

Template.questionList.onRendered(function () {
    let handleRedirect = true;
    redirectTracker = Tracker.autorun(function () {
        let valid_questions = Session.get("valid_questions");
        if (!valid_questions || valid_questions.length === 0) {
            return;
        }

        let allValid = true;
        for (var i = 0; i < valid_questions.length; i++) {
            if (valid_questions[i] !== true) {
                allValid = false;
                break;
            }
        }
        if (!Session.get("overrideValidQuestionRedirect") && allValid && handleRedirect) {
            Session.set("overrideValidQuestionRedirect", undefined);
            Meteor.call("MemberList.removeFromSession", localData.getPrivateKey(), Session.get("hashtag"));
            Meteor.call("EventManager.setActiveQuestion", localData.getPrivateKey(), Session.get("hashtag"), 0);
            Meteor.call("EventManager.setSessionStatus", localData.getPrivateKey(), Session.get("hashtag"), 2);
            Router.go("/memberlist");
        } else {
            Session.set("overrideValidQuestionRedirect", undefined);
            handleRedirect = false;
            redirectTracker.stop();
        }
    });
});

Template.questionList.helpers({
    question: function () {
        var doc = QuestionGroup.findOne();
        return doc ? doc.questionList : false;
    },
    getNormalizedIndex: function (index) {
        return index + 1;
    },
    isActiveIndex: function (index) {
        if(!EventManager.findOne()) {
            return;
        }
        return index === EventManager.findOne().questionIndex;
    },
    hasCompleteContent: function (index) {
        var valid_questions = Session.get("valid_questions");
        valid_questions[index] = lib.checkForValidQuestions(index);
        Session.set("valid_questions",valid_questions);
        return valid_questions[index];
    }
});

Template.questionList.events({
    'click .questionIcon:not(.active)': function (event) {
        Meteor.call("EventManager.setActiveQuestion",localData.getPrivateKey(), Session.get("hashtag"), parseInt($(event.target).closest(".questionIcon").attr("id").replace("questionIcon_","")), function () {
            questionLib.checkForMarkdown();
        });
    },
    'click .removeQuestion': function (event) {
        var id = parseInt($(event.target).closest(".questionIcon").attr("id").replace("questionIcon_",""));
        if(id > 0) {
            Meteor.call("EventManager.setActiveQuestion",localData.getPrivateKey(), Session.get("hashtag"), (id - 1));
        }

        Meteor.call('AnswerOptions.deleteOption',{
            privateKey: localData.getPrivateKey(),
            hashtag: Session.get("hashtag"),
            questionIndex: id,
            answerOptionNumber: -1
        }, (err) => {
            if (err) {
                splashscreen_error.setErrorText(TAPi18n.__("plugins.splashscreen.error.error_messages."+err.reason));
                splashscreen_error.open();
            } else {
                Meteor.call("QuestionGroup.removeQuestion", {
                    privateKey: localData.getPrivateKey(),
                    hashtag: Session.get("hashtag"),
                    questionIndex: id
                }, (err) => {
                    if (err) {
                        splashscreen_error.setErrorText(TAPi18n.__("plugins.splashscreen.error.error_messages."+err.reason));
                        splashscreen_error.open();
                    } else {
                        localData.removeQuestion(Session.get("hashtag"), id);
                        if (QuestionGroup.findOne().questionList.length === 0) {
                            lib.addNewQuestion();
                        }
                    }
                });
            }
        });
    },
    'click #addQuestion': function () {
        lib.addNewQuestion();
        setTimeout(()=> {
            let scrollPane = $(".questionScrollPane");
            scrollPane.scrollLeft(scrollPane.width());
        }, 200);

    }
});