import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

Template.nick.onCreated(function () {
    this.subscribe('MemberList.members', Session.get("hashtag"));
    this.subscribe("EventManager.join", Session.get("hashtag"));
});