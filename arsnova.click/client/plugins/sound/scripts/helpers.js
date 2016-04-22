import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

Template.soundConfig.helpers({
    slider2: function () {
        return Session.get("slider2");
    }
});