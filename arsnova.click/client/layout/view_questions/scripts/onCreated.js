import * as localData from '../../../lib/local_storage.js';

Template.createQuestionView.onCreated(function () {
    this.subscribe('QuestionGroup.authorizeAsOwner', localData.getPrivateKey(), Session.get("hashtag"));
    this.subscribe("EventManager.join",Session.get("hashtag"));
});