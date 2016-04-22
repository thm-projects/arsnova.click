import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import  * as localData from '/client/lib/local_storage.js';
import * as globalHomeLib from '/client/layout/global/scripts/lib.js';

Template.showHashtagsSplashscreen.events({
    "click .js-my-hash": function (event) {
        var hashtag = event.target.text;
        Session.set("isOwner", true);
        Session.set("hashtag", hashtag);
        localData.reenterSession(hashtag);
        Meteor.call('EventManager.add', localData.getPrivateKey(), hashtag, function () {
            globalHomeLib.hashtagSplashscreen.destroy();
            Router.go('/question');
        });
    },
    "click #js-btn-showHashtagManagement": function () {
        globalHomeLib.hashtagSplashscreen.destroy();
        Router.go('/hashtagmanagement');
    }
});