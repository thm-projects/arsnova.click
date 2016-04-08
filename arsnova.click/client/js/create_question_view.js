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

Template.createQuestionView.onCreated(function () {
    if(!Session.get("questionIndex")) Session.set("questionIndex", 0);
    this.autorun(() => {
        this.subscribe('QuestionGroup.authorizeAsOwner', localData.getPrivateKey(), Session.get("hashtag"));
    });
});

Template.createQuestionView.onRendered(function () {
    $(window).resize(calculateWindow());
    calculateWindow();

    var index = Session.get("questionIndex");
    $('body').on('click', '.questionIcon:not(.active)', function () {
        addQuestion(index);
        index = Session.get("questionIndex");
    });
});

Template.createQuestionView.onDestroyed(function () {
    $('body').off('click', '.questionIcon:not(.active)');
});

Template.createQuestionView.helpers({
    //Get question from Sessions-Collection if it already exists
    questionText: function () {
        var currentSession = QuestionGroup.findOne();
        return currentSession && currentSession.questionList[Session.get("questionIndex")] ? currentSession.questionList[Session.get("questionIndex")].questionText : "";
    },
    isFormattingEnabled: function () {
        return $('#markdownBarDiv').hasClass('hide');
    }
});

Template.createQuestionView.events({
    'input #questionText': function () {
        parseQuestionText();
    },
    //Save question in Sessions-Collection when Button "Next" is clicked
    'click #forwardButton': function () {
        parseQuestionText();
        Router.go("/answeroptions");
    },
    "click #backButton": function () {
        Session.set("hashtag", undefined);
        Session.set("isOwner", undefined);
        Router.go("/");
        // TODO: Why is this line after the Router.go() call? Maybe non-reachable code?
        $('.previewSplash').parents('.modal').modal('hide');
    },
    "click #formatPreviewButton": function () {
        var formatPreviewText = $('#formatPreviewText');
        if (formatPreviewText.text() === "Format") {
            formatPreviewText.text("Vorschau");
            $('#formatPreviewGlyphicon').removeClass("glyphicon-cog").addClass("glyphicon-phone");
            $('#markdownBarDiv').removeClass('hide');
            $('#questionText').removeClass('round-corners').addClass('round-corners-markdown');
        } else {
            $('.previewSplash').parents('.modal').modal('show');

            mathjaxMarkdown.initializeMarkdownAndLatex();
            var content = $('#questionText').val();
            
            content = mathjaxMarkdown.getContent(content);

            $("#modalpreview-text").html("");
            $("#modalpreview-text").html(content);

            $('#modalpreview-text').find('p').css("margin-left", "0px");
        }
    }
});

function parseQuestionText() {
    var questionText = $('#questionText').val();
    Meteor.call("QuestionGroup.addQuestion", {
        privateKey: localData.getPrivateKey(),
        hashtag: Session.get("hashtag"),
        questionIndex: Session.get("questionIndex"),
        questionText: questionText
    }, (err, res) => {
        if (err) {
            $('.errorMessageSplash').parents('.modal').modal('show');
            $("#errorMessage-text").html(err.reason);
        } else {
            localData.addQuestion(Session.get("hashtag"), Session.get("questionIndex"), questionText);
        }
    });
}

function addQuestion(index) {
    var questionText = $('#questionText').val();
    Meteor.call("QuestionGroup.addQuestion", {
        privateKey: localData.getPrivateKey(),
        hashtag: Session.get("hashtag"),
        questionIndex: index,
        questionText: questionText
    }, (err, res) => {
        if (err) {
            $('.errorMessageSplash').parents('.modal').modal('show');
            $("#errorMessage-text").html(err.reason);
        } else {
            localData.addQuestion(Session.get("hashtag"), index, questionText);
        }
    });
}

function calculateWindow() {
    var hashtag_length = Session.get("hashtag").length;
    var headerTitel = $(".header-titel");
    var fontSize = "";
    var marginTopModifier = 0;

    if(hashtag_length <= 10){
        if($(document).width() < 1200){
            fontSize = "6vw";
            marginTopModifier = 0.1;
        } else {
            fontSize = "5vw";
            marginTopModifier = 0.2;
        }

    } else if(hashtag_length > 10 && hashtag_length <= 15){
        fontSize = "4vw";
        marginTopModifier = 0.4;
    } else {
        fontSize = "2.5vw";
        marginTopModifier = 0.6;
    }

    headerTitel.css("font-size", fontSize);
    headerTitel.css("margin-top", $(".arsnova-logo").height() * marginTopModifier);
}