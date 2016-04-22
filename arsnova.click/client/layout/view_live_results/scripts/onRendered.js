import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { EventManager } from '/lib/eventmanager.js';
import { AnswerOptions } from '/lib/answeroptions.js';
import * as localData from '/client/lib/local_storage.js';
import {startReadingConfirmationTracker, calculateButtonCount, setMcCSSClasses} from './lib.js';

Template.questionT.onRendered(function () {

});

Template.live_results.onRendered(()=> {
    startReadingConfirmationTracker();

    if (Session.get("isOwner") && EventManager.findOne() && EventManager.findOne().readingConfirmationIndex === -1) {
        Meteor.call("EventManager.showReadConfirmedForIndex", localData.getPrivateKey(), Session.get("hashtag"), 0);
    }
    Session.set("LearnerCountOverride", false);
    calculateButtonCount();
});

Template.result_button.onRendered(function () {
    $(window).resize(function () {
        if (AnswerOptions.find({
                questionIndex: EventManager.findOne().questionIndex,
                isCorrect: 1
            }).count() > 1) {
            setMcCSSClasses();
        }
    });
    if (AnswerOptions.find({
            questionIndex: EventManager.findOne().questionIndex,
            isCorrect: 1
        }).count() > 1) {
        setMcCSSClasses();
    }
});


Template.readingConfirmedLearner.onRendered(function () {
    calculateButtonCount();
});