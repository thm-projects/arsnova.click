import {mathjaxMarkdown} from './../../lib/mathjax_markdown.js';
import {makeAndSendResponse} from '././lib.js';

Template.votingview.events({
    "click #js-btn-showQuestionModal": function (event) {
        event.stopPropagation();
        $('.questionContentSplash').parents('.modal').modal();
        var questionDoc = QuestionGroup.findOne();
        var content = "";
        if (questionDoc) {
            mathjaxMarkdown.initializeMarkdownAndLatex();
            var questionText = questionDoc.questionList[EventManager.findOne().questionIndex].questionText;
            content = mathjaxMarkdown.getContent(questionText);
        }

        $('#questionText').html(content);
    },
    "click #js-showAnswerTexts": function (event) {
        event.stopPropagation();
        mathjaxMarkdown.initializeMarkdownAndLatex();
        $('.answerTextSplash').parents('.modal').modal();
        var content = "";

        AnswerOptions.find({questionIndex: EventManager.findOne().questionIndex}, {sort: {answerOptionNumber: 1}}).forEach(function (answerOption) {
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

        var content = "";
        mathjaxMarkdown.initializeMarkdownAndLatex();

        let hasEmptyAnswers = true;

        AnswerOptions.find({questionIndex: EventManager.findOne().questionIndex}, {sort: {answerOptionNumber: 1}}).forEach(function (answerOption) {
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
        $('.questionAndAnswerTextSplash>#questionText').html(mathjaxMarkdown.getContent(questionDoc.questionList[EventManager.findOne().questionIndex].questionText));
        $('.questionAndAnswerTextSplash>#answerOptionsTxt').html(content);
    },
    "click #forwardButton": function (event) {
        event.stopPropagation();
        if (Session.get("hasSendResponse")) {
            return;
        }

        Session.set("hasSendResponse", true);
        var responseArr = JSON.parse(Session.get("responses"));
        for (var i = 0; i < AnswerOptions.find({questionIndex: EventManager.findOne().questionIndex}).count(); i++) {
            if (responseArr[i]) {
                makeAndSendResponse(i);
            }
        }
        if (EventManager.findOne().questionIndex + 1 >= QuestionGroup.findOne().questionList.length) {
            Session.set("sessionClosed", true);
        }
        Router.go("/results");
    },
    "click .sendResponse": function (event) {
        event.stopPropagation();

        if (Session.get("questionSC")) {
            makeAndSendResponse(event.currentTarget.id);
            Router.go("/results");
        } else {
            var responseArr = JSON.parse(Session.get("responses"));
            var currentId = event.currentTarget.id;
            responseArr[currentId] = responseArr[currentId] ? false : true;
            Session.set("responses", JSON.stringify(responseArr));
            Session.set("hasToggledResponse", JSON.stringify(responseArr).indexOf("true") > -1);
            $(event.target).toggleClass("answer-selected");
        }
    }
});