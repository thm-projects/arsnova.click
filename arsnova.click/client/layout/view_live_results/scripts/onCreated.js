import {countdown, eventManagerObserver, deleteCountdown, setEventManagerObserver} from './lib.js';
import {mathjaxMarkdown} from '../../../lib/mathjax_markdown.js';

Template.questionT.onCreated(function () {
    this.subscribe("EventManager.join", Session.get("hashtag"));
    this.subscribe('AnswerOptions.options', Session.get("hashtag"));
    this.subscribe('QuestionGroup.questionList', Session.get("hashtag"));
    this.subscribe('MemberList.members', Session.get("hashtag"));
});

Template.live_results.onCreated(function () {
    var oldStartTimeValues = {};
    var initQuestionIndex = -1;
    deleteCountdown();

    this.subscribe('EventManager.join', Session.get("hashtag"), function () {
        initQuestionIndex = EventManager.findOne().questionIndex;
        setEventManagerObserver(EventManager.find().observeChanges({
            changed: function (id, changedFields) {
                if (!isNaN(changedFields.sessionStatus)) {
                    if (changedFields.sessionStatus === 2) {
                        $('.modal-backdrop').remove();
                        eventManagerObserver.stop();
                        Router.go("/memberlist");
                    } else if (changedFields.sessionStatus < 2) {
                        $('.modal-backdrop').remove();
                        eventManagerObserver.stop();
                        Router.go("/resetToHome");
                    }
                } else if (!isNaN(changedFields.questionIndex) && changedFields.questionIndex !== initQuestionIndex) {
                    if (Session.get("isOwner")) {
                        mathjaxMarkdown.initializeMarkdownAndLatex();
                        $('.answerTextSplash').parents('.modal').modal();
                        var content = "";
                        AnswerOptions.find({questionIndex: EventManager.findOne().questionIndex}, {sort: {answerOptionNumber: 1}}).forEach(function (answerOption) {
                            if (!answerOption.answerText) {
                                answerOption.answerText = "";
                            }

                            content += String.fromCharCode((answerOption.answerOptionNumber + 65)) + "<br/>";
                            content += mathjaxMarkdown.getContent(answerOption.answerText) + "<br/>";
                        });

                        $('#answerOptionsTxt').html(content);
                        setTimeout(function () {
                            $('.answerTextSplash').parents('.modal').modal("hide");
                        }, 10000);
                    } else {
                        Router.go("/onpolling");
                    }
                }
            }
        }));
    });
    this.subscribe('Responses.session', Session.get("hashtag"));
    this.subscribe('AnswerOptions.options', Session.get("hashtag"));
    this.subscribe('MemberList.members', Session.get("hashtag"));
    this.subscribe('QuestionGroup.questionList', Session.get("hashtag"), function () {
        var doc = QuestionGroup.findOne();
        var i = 0;
        for (i; i < doc.questionList.length; i++) {
            oldStartTimeValues[i] = doc.questionList[i].startTime;
        }
        Session.set("oldStartTimeValues", oldStartTimeValues);
    });
    this.subscribe('Hashtags.public');
});