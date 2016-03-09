Template.nick.onCreated(function () {
    this.autorun(() => {
        this.subscribe('MemberList.members', Session.get("hashtag"));
    });
});

Template.nick.onRendered(function () {
    $("#forwardButton").attr("disabled", "disabled");
});

Template.nick.events({
    "click #forwardButton": function () {
        var nickname = $("#nickname-input-field").val();
        Meteor.call('MemberList.addLearner', {
            hashtag: Session.get("hashtag"),
            nick: nickname
        }, (err, res) => {
            if (err) {
                alert(err);
            } else {
                Session.set("nick", nickname);
                Router.go("/memberlist");
            }
        });
    },
    "click #backButton": function () {
        Router.go("/");
    },
    'input #nickname-input-field': function (event) {
        var hashtag = Session.get("hashtag");
        var currentNickName = event.currentTarget.value;
        if (currentNickName.length > 2) {
            $("#forwardButton").removeAttr("disabled");
        } else {
            $("#forwardButton").attr("disabled", "disabled");
        }
        var member = MemberList.findOne({nick: currentNickName});
        if (!member){
            $("#addNickname").prop('disabled', false);
        }else{
            $("#addNickname").prop('disabled', true);
        }
    }
});