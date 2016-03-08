Meteor.setInterval(function () {
    var sessionDeleteAfterIdleMinutes = 5; //Minutes to session is idle
    var now = (new Date()).getTime();
    var sessionDeleteTimeInMilliseconds = (sessionDeleteAfterIdleMinutes * 60 * 1000);
    Hashtags.find({lastConnection: {$lt: (now - sessionDeleteTimeInMilliseconds)}}).forEach(function (session) {
        //Remove Session-Datas
        console.log("Found idle connection");
    });
}, 60 * 1000);