import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { calculateButtonCount } from './lib.js';

Template.leaderBoard.onRendered(function () {
    calculateButtonCount();


    $(window).resize(function () {
        if(Session.get('responsesCountOverride') && (Session.get("allMembersCount") - Session.get("maxResponseButtons") === 0)) {
            Session.set('responsesCountOverride', false);
        }
        calculateButtonCount();
    });
});