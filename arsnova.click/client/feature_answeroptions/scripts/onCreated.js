Template.createAnswerOptions.onCreated(function () {
    this.subscribe('AnswerOptions.instructor', localData.getPrivateKey(), Session.get("hashtag"));
    this.subscribe('EventManager.join', Session.get("hashtag"));
});