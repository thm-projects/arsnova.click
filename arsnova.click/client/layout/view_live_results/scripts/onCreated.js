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
 * along with ARSnova Click.  If not, see <http://www.gnu.org/licenses/>.*/

import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import {TAPi18n} from 'meteor/tap:i18n';
import {EventManager} from '/lib/eventmanager.js';
import {AnswerOptions} from '/lib/answeroptions.js';
import {QuestionGroup} from '/lib/questions.js';
import {mathjaxMarkdown} from '/client/lib/mathjax_markdown.js';
import {Splashscreen, splashscreen_error} from '/client/plugins/splashscreen/scripts/lib.js';
import {globalEventStackObserver} from '/client/plugins/event_stack_observer/scripts/lib.js';
import {deleteCountdown} from './lib.js';

Template.live_results.onCreated(function () {
    var oldStartTimeValues = {};
    var initQuestionIndex = -1;
    deleteCountdown();

    var doc = QuestionGroup.findOne();
    var i = 0;
    for (i; i < doc.questionList.length; i++) {
        oldStartTimeValues[i] = doc.questionList[i].startTime;
    }
    Session.set("oldStartTimeValues", oldStartTimeValues);

    globalEventStackObserver.onChange(function (key, value) {
        if (key === "EventManager.setSessionStatus" || key === "EventManager.reset" && !isNaN(value.sessionStatus)) {
            if (value.sessionStatus === 2) {
                $('.modal-backdrop').remove();
                Router.go("/memberlist");
            } else if (value.sessionStatus < 2) {
                $('.modal-backdrop').remove();
                Router.go("/resetToHome");
            }
        }
    });

    globalEventStackObserver.onChange(function (key, value) {
        if (key === "EventManager.setActiveQuestion" && !isNaN(value.questionIndex) && value.questionIndex !== initQuestionIndex) {
            if (Session.get("isOwner")) {
                new Splashscreen({
                    autostart: true,
                    instanceId: "answers_"+EventManager.findOne().questionIndex,
                    templateName: 'questionAndAnswerSplashscreen',
                    closeOnButton: '#js-btn-hideQuestionModal',
                    onRendered: function (instance) {
                        var content = "";
                        mathjaxMarkdown.initializeMarkdownAndLatex();
                        AnswerOptions.find({questionIndex: EventManager.findOne().questionIndex}, {sort: {answerOptionNumber: 1}}).forEach(function (answerOption) {
                            if (!answerOption.answerText) {
                                answerOption.answerText = "";
                            }

                            content += String.fromCharCode((answerOption.answerOptionNumber + 65)) + "<br/>";
                            content += mathjaxMarkdown.getContent(answerOption.answerText) + "<br/>";
                        });

                        instance.templateSelector.find('#answerContent').html(content);
                        setTimeout(function () {
                            instance.close();
                        }, 10000);
                    }
                });
            } else {
                Router.go("/onpolling");
            }
        }
    });

    globalEventStackObserver.onChange(function (key, value) {
        if (key === "EventManager.showReadConfirmedForIndex" && !isNaN(value.readingConfirmationIndex) && value.readingConfirmationIndex > -1) {
            var questionDoc = QuestionGroup.findOne();
            new Splashscreen({
                autostart: true,
                templateName: 'readingConfirmedSplashscreen',
                closeOnButton: '#setReadConfirmed',
                onRendered: function (instance) {
                    var content = "";
                    if (questionDoc) {
                        mathjaxMarkdown.initializeMarkdownAndLatex();
                        var questionText = questionDoc.questionList[EventManager.findOne().readingConfirmationIndex].questionText;
                        content = mathjaxMarkdown.getContent(questionText);
                    }
                    instance.templateSelector.find('#questionContent').html(content);

                    if ( Session.get("isOwner") ) {
                        instance.templateSelector.find('#setReadConfirmed').text(TAPi18n.__("global.close_window"));
                    } else {
                        instance.templateSelector.find('#setReadConfirmed').parent().on('click', '#setReadConfirmed', function () {
                            Meteor.call("MemberList.setReadConfirmed", {
                                hashtag: Session.get("hashtag"),
                                questionIndex: EventManager.findOne().readingConfirmationIndex,
                                nick: Session.get("nick")
                            }, (err)=> {
                                if (err) {
                                    splashscreen_error.setErrorText(TAPi18n.__("plugins.splashscreen.error.error_messages."+err.reason));
                                    splashscreen_error.open();
                                }
                            });
                        });
                    }
                }
            });
        }
    });
});