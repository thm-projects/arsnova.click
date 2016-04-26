import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

Template.createTimerView.helpers({
    slider: function () {
        return Session.get("slider");
    }
});