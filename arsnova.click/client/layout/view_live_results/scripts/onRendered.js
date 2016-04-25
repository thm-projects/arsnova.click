import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { EventManager } from '/lib/eventmanager.js';
import * as localData from '/client/lib/local_storage.js';
import {startReadingConfirmationTracker, calculateButtonCount} from './lib.js';

Template.live_results.onRendered(()=> {
    startReadingConfirmationTracker();

    if (Session.get("isOwner") && EventManager.findOne() && EventManager.findOne().readingConfirmationIndex === -1) {
        Meteor.call("EventManager.showReadConfirmedForIndex", localData.getPrivateKey(), Session.get("hashtag"), 0);
    }
    Session.set("LearnerCountOverride", false);
    calculateButtonCount();
});

Template.readingConfirmedLearner.onRendered(function () {
    calculateButtonCount();
});