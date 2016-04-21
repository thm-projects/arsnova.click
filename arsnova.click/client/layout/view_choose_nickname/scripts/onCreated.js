Template.nick.onCreated(function () {
    this.subscribe('MemberList.members', Session.get("hashtag"));
    this.subscribe("EventManager.join", Session.get("hashtag"));
});