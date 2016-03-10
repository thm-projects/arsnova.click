Template.leaderBoard.onCreated(function () {
    this.autorun(() => {
        this.subscription = Meteor.subscribe('Responses.instructor', Session.get("hashtag"), function () {
            Session.set("responsesLoaded", true);
        });
        this.subscription = Meteor.subscribe('AnswerOptions.options', Session.get("hashtag"), function () {
            Session.set("answerOptionsLoaded", true);
        });
        this.subscription = Meteor.subscribe('MemberList.members', Session.get("hashtag"), function () {
            Session.set("memberListLoaded", true);
        });
    });
});

Template.leaderBoard.helpers({
    "leaderBoardItems": function () {
        var leaderBoardItems = [];
        var allGoodMembers = [];
        var rightAnswerOptions = AnswerOptions.find({isCorrect: 1});
        if (Session.get("responsesLoaded") && Session.get("memberListLoaded") && Session.get("answerOptionsLoaded")) {
            var memberNicks = MemberList.find({}, {fields: {nick: 1}});
            memberNicks.forEach(function (member) {
                var entry = {
                    nick: member.nick,
                    responseTime: 0
                };
                var userResponses = Responses.find({userNick: member.nick});
                var userHasRightAnswers = true;
                // only put member in leaderboard when he clicked the right amount, then check whether he clicked all the right ones
                var totalResponseTime = 0;
                if ((userResponses.count() === rightAnswerOptions.count()) && (userResponses.count() > 0) && userHasRightAnswers ) {
                    userResponses.forEach(function (userResponse) {
                        var checkAnswerOptionDoc = AnswerOptions.findOne({isCorrect: 1, answerOptionNumber: userResponse.answerOptionNumber});
                        if (!checkAnswerOptionDoc) {
                            userHasRightAnswers = false;
                        }
                        else {
                            totalResponseTime += userResponse.responseTime;
                        }
                    });
                    if (userHasRightAnswers) {
                        entry.responseTime = totalResponseTime / rightAnswerOptions.count();
                        allGoodMembers.push(entry);
                    }
                }
            });
        }
        var sortedArray = _.sortBy(allGoodMembers, 'responseTime').slice(0,6);
        console.log(sortedArray);
        return sortedArray;
    }
});