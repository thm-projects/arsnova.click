import { Template } from 'meteor/templating';
import {validationTrackerHandle, subscriptionHandler} from './lib.js';

Template.createTimerView.onDestroyed(function () {
    var body = $('body');
    body.off('click', '.questionIcon:not(.active)');
    body.off('click', '.removeQuestion');
    validationTrackerHandle.stop();
    subscriptionHandler.stop();
});