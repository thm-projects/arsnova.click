import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { countdown, routeToLeaderboardTimer, readingConfirmationTracker } from './lib.js';

Template.live_results.onDestroyed(function () {
    Session.set("countdownInitialized", undefined);
    Session.set("sessionCountDown", undefined);
    if (countdown) {
        countdown.stop();
    }
    if (routeToLeaderboardTimer) {
        clearTimeout(routeToLeaderboardTimer);
    }
    if (readingConfirmationTracker) {
        readingConfirmationTracker.stop();
    }
});