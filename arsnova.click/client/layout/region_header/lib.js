import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { QuestionGroup } from '/lib/questions.js';
import { AnswerOptions } from '/lib/answeroptions.js';
import { splashscreen_error } from '/client/plugins/splashscreen/scripts/lib.js';
import * as localData from '/client/lib/local_storage.js';

export function checkForValidQuestions(index) {
    var questionDoc = QuestionGroup.findOne();
    var answerDoc = AnswerOptions.find({questionIndex: index});
    if(!questionDoc || !answerDoc) {
        return false;
    }

    var question = questionDoc.questionList[index];
    if(!question) {
        return false;
    }

    if(!question.questionText || question.questionText.length < 5 || question.questionText.length > 10000) {
        return false;
    }
    if(!question.timer || isNaN(question.timer) || question.timer < 5000 || question.timer > 260000) {
        return false;
    }

    var hasValidAnswers = false;
    answerDoc.forEach(function (value) {
        if(typeof value.answerText === "undefined" || value.answerText.length <= 500) {
            hasValidAnswers = true;
        }
    });
    return hasValidAnswers;
}

export function addNewQuestion(){
    var index = QuestionGroup.findOne().questionList.length;
    Meteor.call("QuestionGroup.addQuestion", {
        privateKey: localData.getPrivateKey(),
        hashtag: Session.get("hashtag"),
        questionIndex: index,
        questionText: ""
    }, (err) => {
        if (err) {
            splashscreen_error.setErrorText(err.reason);
            splashscreen_error.open();
        } else {
            for(var i = 0; i < 4; i++) {
                Meteor.call('AnswerOptions.addOption',{
                    privateKey:localData.getPrivateKey(),
                    hashtag:Session.get("hashtag"),
                    questionIndex: index,
                    answerOptionNumber:i,
                    answerText:"",
                    isCorrect:0
                });
            }

            localData.addQuestion(Session.get("hashtag"), QuestionGroup.findOne().questionList.length, "");

            var valid_questions = Session.get("valid_questions");
            valid_questions[index] = false;
            Session.set("valid_questions",valid_questions);

            Meteor.call("EventManager.setActiveQuestion",localData.getPrivateKey(), Session.get("hashtag"), index, function () {
                Router.go("/question");
            });
        }
    });
}

export function calculateTitelHeight() {
    var fixedTop = $(".navbar-fixed-top");
    var container = $(".container");
    var footerHeight = $("#footerBar").hasClass("hide") ? $(".fixed-bottom").outerHeight() + $(".footer-info-bar").outerHeight() : $(".fixed-bottom").outerHeight();
    var final_height = $(window).height() - fixedTop.outerHeight() - $(".navbar-fixed-bottom").outerHeight() - footerHeight;

    container.css("height", final_height);
    container.css("margin-top", fixedTop.outerHeight());

    $(".kill-session-switch-wrapper").css("top", $(".arsnova-logo").height() * 0.4);
}