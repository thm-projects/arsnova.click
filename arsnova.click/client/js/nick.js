Template.nick.onCreated(function () {
    this.autorun(() => {
        this.subscribe('MemberList.members', Session.get("hashtag"));
    });
});

Template.nick.events({
    "click #addNickname": function () {
        var nickname = $("#nickname-input-field").val();
        console.log(nickname);
        Meteor.call('MemberList.addLearner', Session.get("hashtag"), nickname);
        Router.go("/memberlist");
    },
    "click #backToHome": function () {
        Router.go("/");
    },
    'input #nickname-input-field': function (event) {
        console.log(Session.get("hashtag"));
        console.log(event.currentTarget.value);
        var hashtag = Session.get("hashtag");
        var currentNickName = event.currentTarget.value;
        console.log(MemberList.find().count());
        var member = MemberList.findOne({nick: currentNickName});
        if (!member){
            $("#addNickname").prop('disabled', false);
        }else{
            $("#addNickname").prop('disabled', true);
        }
    }
});