import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { MemberList } from '/lib/memberlist.js';

Template.memberlist.helpers({
    hashtag: function () {
        return Session.get("hashtag");
    },
    isOwner: function () {
        return Session.get("isOwner");
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
    memberlistCount: function () {
        return MemberList.find().count();
    }
});

Template.learner.helpers({
    isOwnNick: function (nickname) {
        return nickname === Session.get("nick");
    }
});