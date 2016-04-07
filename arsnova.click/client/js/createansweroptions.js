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

Template.createAnswerOptions.onCreated(function () {
    if (!Session.get("questionIndex")) Session.set("questionIndex", 0);
    this.autorun(() => {
        this.subscription = Meteor.subscribe('AnswerOptions.instructor', localData.getPrivateKey(), Session.get("hashtag"));
    });
});

Template.createAnswerOptions.onRendered(function () {
    var calculateHeight = function calculateHeight() {
        var answer_options_height = $(".container").height() - $(".row-landingpage-buttons").outerHeight(true) - $(".titel-relative").outerHeight(true);
        $('.answer-options').css("height", answer_options_height);
    };
    $(window).resize(calculateHeight);
    calculateHeight();

    var index = Session.get("questionIndex");
    $('body').on('click', '.questionIcon:not(.active)', function () {
        parseAnswerOptionInput(index);
        index = Session.get("questionIndex");
    });
});

Template.createAnswerOptions.onDestroyed(function () {
    $('body').off('click', '.questionIcon:not(.active)');
});

Template.createAnswerOptions.helpers({
    answerOptions: function () {
        return AnswerOptions.find({questionIndex: Session.get("questionIndex")}, {sort: {answerOptionNumber: 1}});
    },
    answerOptionLetter: function (Nr) {
        return String.fromCharCode(Nr + 65);
    },
    showDeleteButtonOnStart: function () {
        return (AnswerOptions.find({questionIndex: Session.get("questionIndex")}).count() === 1) ? "hide" : "";
    }
});

Template.createAnswerOptions.events({
    "click .toggleCorrect": function (event) {
        if (this.isCorrect) {
            this.isCorrect = 0;
            $(event.currentTarget.firstElementChild).removeClass("check-mark-checked");
            $(event.currentTarget.firstElementChild).addClass("check-mark-unchecked");
        }
        else {
            this.isCorrect = 1;
            $(event.currentTarget.firstElementChild).removeClass("check-mark-unchecked");
            $(event.currentTarget.firstElementChild).addClass("check-mark-checked");
        }
    },
    "click #addAnswerOption": function () {
        var answerOptionsCount = AnswerOptions.find({questionIndex: Session.get("questionIndex")}).count();
        if (answerOptionsCount < 26) {
            const answerOption = {
                privateKey: localData.getPrivateKey(),
                hashtag: Session.get("hashtag"),
                questionIndex: Session.get("questionIndex"),
                answerText: "",
                answerOptionNumber: answerOptionsCount,
                isCorrect: 0
            };

            Meteor.call('AnswerOptions.addOption', answerOption, (err, res) => {
                if (err) {
                    $('.errorMessageSplash').parents('.modal').modal('show');
                    $("#errorMessage-text").html(err.reason);
                } else {
                    localData.addAnswers(answerOption);

                    $("#deleteAnswerOption").removeClass("hide");

                    answerOptionsCount++;
                    if (answerOptionsCount > 25) {
                        $("#addAnswerOption").addClass("hide");
                    }

                    $('.answer-options').scrollTop($('.answer-options')[0].scrollHeight);
                }
            });
        }
    },
    "click #deleteAnswerOption": function (event) {
        var answerOptionsCount = AnswerOptions.find({questionIndex: Session.get("questionIndex")}).count();
        if (answerOptionsCount > 1) {
            $("#addAnswerOption").removeClass("hide");

            Meteor.call('AnswerOptions.deleteOption', {
                privateKey: localData.getPrivateKey(),
                hashtag: Session.get("hashtag"),
                questionIndex: Session.get("questionIndex"),
                answerOptionNumber: answerOptionsCount - 1
            });
            localData.deleteAnswerOption(Session.get("hashtag"), Session.get("questionIndex"), answerOptionsCount - 1);

            answerOptionsCount--;
            if (answerOptionsCount === 1) {
                $("#deleteAnswerOption").addClass("hide");
            } else if (answerOptionsCount > 2) {
                $('.answer-options').scrollTop($('.answer-options')[0].scrollHeight);
            }
        }
    },
    "click #backButton": function (event) {
        Router.go('/question');
    },
    "click #forwardButton": function (event) {
        var error = parseAnswerOptionInput(Session.get("questionIndex"));

        if (error) {
            $('.errorMessageSplash').parents('.modal').modal('show');
            $("#errorMessage-text").html(error.reason);
        } else {
            Router.go("/settimer");
        }
    },
    "keydown .input-field": function (event) {
        //Prevent tab default
        if (event.keyCode === 9) {
            event.preventDefault();
        }

        if (event.keyCode === 9 || event.keyCode === 13) {
            var nextElement = $(event.currentTarget).closest(".form-group").next();
            if (nextElement.length > 0) {
                nextElement.find(".input-field").focus();
            } else {
                $("#addAnswerOption").click();
                //sets focus to the new input field
                $(event.currentTarget).closest(".form-group").next().find(".input-field").focus();
            }
        }
    }
});

function parseAnswerOptionInput(index) {
    var hasError = false;
    for (var i = 0; i < AnswerOptions.find({questionIndex: index}).count(); i++) {
        var text = $("#answerOptionText_Number" + i).val();
        var isCorrect = $('div#answerOption-' + i + ' .check-mark-checked').length > 0 ? 1 : 0;
        var answer = {
            privateKey: localData.getPrivateKey(),
            hashtag: Session.get("hashtag"),
            questionIndex: index,
            answerOptionNumber: i,
            answerText: text,
            isCorrect: isCorrect
        };
        Meteor.call('AnswerOptions.updateAnswerTextAndIsCorrect', answer,
            (err, res) => {
                hasError = err;
            }
        );
    }
    return hasError;
}