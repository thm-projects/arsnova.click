Template.memberlist.helpers({
    hashtag: function () {
        return Session.get("hashtag");
    },
    isOwner: function () {
        return Session.get("isOwner");
    },
    isLearnerCountOverride: function () {
        return Session.get('LearnerCountOverride');
    },
    learners: function () {
        var sortParamObj = Session.get('LearnerCountOverride') ? {lowerCaseNick: 1} : {insertDate: -1};
        return [
            MemberList.find({nick: Session.get("nick")}, {
                limit: 1
            }),
            MemberList.find({nick: {$ne: Session.get("nick")}}, {
                limit: (Session.get("LearnerCount") - 1),
                sort: sortParamObj
            })
        ];
    },
    showMoreButton: function () {
        return ((MemberList.find().count() - Session.get("LearnerCount")) > 1);
    },
    invisibleLearnerCount: function () {
        return MemberList.find().count() - Session.get("LearnerCount");
    },
    titleText: function () {
        return 'Quiz-Lobby ... ';
    },
    memberlistCount: function () {
        return MemberList.find().count();
    }
});

Template.kickMemberConfirmation.helpers({
    kicked_nick_name: function () {
        return Session.get("nickToBeKicked") ? Session.get("nickToBeKicked").nick_name : "";
    }
});

Template.learner.helpers({
    isOwnNick: function (nickname) {
        return nickname === Session.get("nick");
    }
});