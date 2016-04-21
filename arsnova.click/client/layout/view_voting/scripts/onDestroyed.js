import {countdown} from '././lib.js';

Template.votingview.onDestroyed(function () {
    Session.set("questionSC", undefined);
    Session.set("responses", undefined);
    Session.set("countdownInitialized", undefined);
    Session.set("hasToggledResponse", undefined);
    Session.set("hasSendResponse", undefined);
    if (countdown) {
        countdown.stop();
    }
});