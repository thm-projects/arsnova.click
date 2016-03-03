Meteor.subscribe("memberlist");

Template.nick.events({
    "click #addNickname": function () {
        var nickname = $("#nickname-input-field").val();
        console.log(nickname);
        Meteor.call('MemberList.addLearner', Session.get("hashtag"), nickname);
        Router.go("/memberlist");
    },
    "click #backToHome": function () {
        Router.go("/");
    }
})