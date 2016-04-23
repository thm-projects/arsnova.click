import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

Template.soundConfig.onCreated(function () {
    Session.setDefault("slider2", 80);
    Session.setDefault("globalVolume", 80);
});
