import * as lib from './lib.js';

Template.createAnswerOptions.onDestroyed(function () {
    var body = $('body');
    body.off('click', '.questionIcon:not(.active)');
    body.off('click', '.removeQuestion');
    lib.subscriptionHandler.stop();
});