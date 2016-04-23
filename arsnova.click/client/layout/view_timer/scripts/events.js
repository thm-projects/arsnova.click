import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { EventManager } from '/lib/eventmanager.js';
import * as localData from '/client/lib/local_storage.js';
import { splashscreen_error } from '/client/plugins/splashscreen/scripts/lib.js';
import { setTimer } from './lib.js';

Template.createTimerView.events({
    "click #forwardButton, click #backButton": function (event) {
        var err = setTimer(EventManager.findOne().questionIndex);

        if (err) {
            splashscreen_error.setErrorText(err.reason);
            splashscreen_error.open();
        } else {
            if ($(event.currentTarget).attr("id") === "forwardButton") {
                Meteor.call("MemberList.removeFromSession", localData.getPrivateKey(), Session.get("hashtag"));
                Meteor.call("EventManager.setActiveQuestion", localData.getPrivateKey(), Session.get("hashtag"), 0);
                Meteor.call("EventManager.setSessionStatus", localData.getPrivateKey(), Session.get("hashtag"), 2);
                Router.go("/memberlist");
            } else {
                Router.go("/answeroptions");
            }
        }
    }
});