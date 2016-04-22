import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { EventManager } from '/lib/eventmanager.js';
import { QuestionGroup } from '/lib/questions.js';
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
                lib.checkForMarkdown();
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