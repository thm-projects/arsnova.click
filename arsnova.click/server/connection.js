Meteor.setInterval(function () {
    var sessionDeleteAfterIdleMinutes = 5; //Minutes to session is idle
    var now = (new Date()).getTime();
    var sessionDeleteTimeInMilliseconds = (sessionDeleteAfterIdleMinutes * 60 * 1000);
    Hashtags.find({lastConnection: {$lt: (now - sessionDeleteTimeInMilliseconds)}}).forEach(function (session) {
        //Remove Session-Datas
        AnswerOptions.remove({hashtag: session.hashtag});
        MemberList.remove({hashtag: session.hashtag});
        Responses.remove({hashtag: session.hashtag});
        Sessions.remove({hashtag: session.hashtag});
    });
}, 60 * 1000);