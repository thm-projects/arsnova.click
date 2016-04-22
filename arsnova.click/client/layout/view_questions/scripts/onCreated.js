import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import * as localData from '/client/lib/local_storage.js';

Template.createQuestionView.onCreated(function () {
    this.subscribe('QuestionGroup.authorizeAsOwner', localData.getPrivateKey(), Session.get("hashtag"));
    this.subscribe("EventManager.join",Session.get("hashtag"));
});