import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { EventManager } from '/lib/eventmanager.js';
import { QuestionGroup } from '/lib/questions.js';
import { mathjaxMarkdown } from '/client/lib/mathjax_markdown.js';
import * as lib from './lib.js';

Template.createQuestionView.onRendered(function () {
    Session.set("markdownAlreadyChecked", false);
    lib.calculateWindow();
    $(window).resize(lib.calculateWindow());

    let index;
    lib.subscriptionHandler = Tracker.autorun(()=>{
        if(this.subscriptionsReady()) {
            index = EventManager.findOne().questionIndex;
            if (!Session.get("markdownAlreadyChecked")) {
                checkForMarkdown();
                Session.set("markdownAlreadyChecked", true);
            }
        }
    });
    var body = $('body');
    body.on('click', '.questionIcon:not(.active)', function () {
        var currentSession = QuestionGroup.findOne();
        if(!currentSession || index >= currentSession.questionList.length) {
            return;
        }

        lib.addQuestion(index);
    });
    body.on('click', '.removeQuestion', function () {
        index = EventManager.findOne().questionIndex;
    });
});

Template.questionPreviewSplashscreen.onRendered(function () {
    lib.calculateAndSetPreviewSplashWidthAndHeight();
    $(window).resize(function () {
        lib.calculateAndSetPreviewSplashWidthAndHeight();
    });
});

function checkForMarkdown () {
    var questionText = QuestionGroup.findOne().questionList[EventManager.findOne().questionIndex].questionText;
    if (lib.questionContainsMarkdownSyntax(questionText)) {
        lib.changePreviewButtonText("Bearbeiten");

        mathjaxMarkdown.initializeMarkdownAndLatex();

        questionText = mathjaxMarkdown.getContent(questionText);

        $("#questionTextDisplay").html(questionText);
        $('#editQuestionText').hide();
        $('#previewQuestionText').show();
    } else {
        if ($(window).width() >= 992) {
            $('#questionText').focus();
        }
    }
};