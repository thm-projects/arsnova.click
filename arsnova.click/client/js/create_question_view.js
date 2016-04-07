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
    this.autorun(() => {
        this.subscribe('Sessions.instructor', localData.getPrivateKey(), Session.get("hashtag"), function () {
        var sessionDoc = Sessions.findOne({hashtag: Session.get("hashtag")});
        if (sessionDoc && sessionDoc.questionText.length > 4) {
            $("#forwardButton").removeAttr("disabled");
        }
        else {
            $("#forwardButton").attr("disabled", "disabled");
        }
    });
});
});

Template.createQuestionView.helpers({
    //Get question from Sessions-Collection if it already exists
    questionText: function () {
        var currentSession = Sessions.findOne({hashtag: Session.get("hashtag")});
        if (currentSession) {
            return currentSession.questionText;
        }
        else {
            return "";
        }
    },
    isFormattingEnabled: function () {
        return $('#markdownBarDiv').hasClass('hide');
    }
});

Template.createQuestionView.events({
    "input #questionText": function (event) {
        var questionText = event.currentTarget.value;
        if (questionText.length > 4) {
            $("#forwardButton").removeAttr("disabled");
        } else {
            $("#forwardButton").attr("disabled", "disabled");
        }
    },
    //Save question in Sessions-Collection when Button "Next" is clicked
    'click #forwardButton': function () {
        var questionText = $('#questionText').val();
        Meteor.call("Sessions.setQuestion", {
            privateKey: localData.getPrivateKey(),
            hashtag: Session.get("hashtag"),
            questionText: questionText
        }, (err, res) => {
            if (err) {
                $('.errorMessageSplash').parents('.modal').modal('show');
                $("#errorMessage-text").html(err.reason);
            } else {
                localData.addQuestion(Session.get("hashtag"), questionText);
        Router.go("/answeroptions");
            }
        });
    },
    "click #backButton": function () {
        var questionText = $('#questionText').val();
        Session.set("hashtag", undefined);
        Session.set("isOwner", undefined);
        Router.go("/");
        $('.previewSplash').parents('.modal').modal('hide');
    },
    "click #formatPreviewButton": function () {
        if ($('#formatPreviewText').text() == "Format") {
            $('#formatPreviewText').text("Vorschau");
            $('#formatPreviewGlyphicon').removeClass("glyphicon-cog");
            $('#formatPreviewGlyphicon').addClass("glyphicon-phone");
            $('#markdownBarDiv').removeClass('hide');
            $('#questionText').removeClass('round-corners');
            $('#questionText').addClass('round-corners-markdown');
        } else {
            $('.previewSplash').parents('.modal').modal('show');

            mathjaxMarkdown.initializeMarkdownAndLatex();
            var content = $('#questionText').val();

            content = mathjaxMarkdown.getContent(content);

            $("#modalpreview-text").html(content);
        }
    }
});

Template.createQuestionView.onRendered(function () {
    $(window).resize(function () {

        var hashtag_length = Session.get("hashtag").length;

        //take the hastag in the middle of the logo
        var titel_margin_top  = $(".arsnova-logo").height();

        if(hashtag_length <= 10){
            if($(document).width() < 1200){
                $(".header-titel").css("font-size", "6vw");
                $(".header-titel").css("margin-top", titel_margin_top * 0.1);
            } else {
                $(".header-titel").css("font-size", "5vw");
                $(".header-titel").css("margin-top", titel_margin_top * 0.2);
            }

        } else if(hashtag_length > 10 && hashtag_length <= 15){
            $(".header-titel").css("font-size", "4vw");
            $(".header-titel").css("margin-top", titel_margin_top * 0.4);
        } else {
            $(".header-titel").css("font-size", "2.5vw");
            $(".header-titel").css("margin-top", titel_margin_top * 0.6);
        }


    });
});


Template.createQuestionView.rendered = function () {

    var hashtag_length = Session.get("hashtag").length;

    //take the hastag in the middle of the logo
    var titel_margin_top  = $(".arsnova-logo").height();

    if(hashtag_length <= 10){
        if($(document).width() < 1200){
            $(".header-titel").css("font-size", "6vw");
            $(".header-titel").css("margin-top", titel_margin_top * 0.1);
        } else {
            $(".header-titel").css("font-size", "5vw");
            $(".header-titel").css("margin-top", titel_margin_top * 0.2);
        }

    } else if(hashtag_length > 10 && hashtag_length <= 15){
        $(".header-titel").css("font-size", "4vw");
        $(".header-titel").css("margin-top", titel_margin_top * 0.4);
    } else {
        $(".header-titel").css("font-size", "2.5vw");
        $(".header-titel").css("margin-top", titel_margin_top * 0.6);
    }

};