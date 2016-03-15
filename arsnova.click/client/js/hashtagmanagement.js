Template.hashtagManagement.onCreated(function () {
    this.autorun(() => {
        this.subscribe('Hashtags.public');
    });
});

Template.hashtagManagement.helpers({
    serverHashtags: function () {
        return localData.getAllHashtags();
    }
});

Template.hashtagManagement.events({
    "click .js-reactivate-hashtag": function (event) {
        var hashtag = $(event.currentTarget).parent().parent()[0].id;
        localData.reenterSession(hashtag);
        Session.set("isOwner", true);
        Session.set("hashtag", hashtag);
        Meteor.call("Hashtags.setSessionStatus", localData.getPrivateKey(), hashtag, 1);
        Router.go("/question");
    },
    "click .js-export": function (event) {
        var hashtag = $(event.currentTarget).parent().parent()[0].id;
        var localStorageData = JSON.parse(localStorage.getItem(hashtag));
        if (localStorageData) {
            var hashtagDoc = {
                hashtag: localStorageData.hashtag,
                sessionStatus: 0,
                lastConnection: 0
            };
            var sessionDoc = {
                hashtag: localStorageData.hashtag,
                questionText: localStorageData.questionText,
                timer: localStorageData.timer,
                isReadingConfirmationRequired: localStorageData.isReadingConfirmationRequired
            };
            answerOptionsDoc = [];
            localStorageData.answers.forEach(function (answerOption) {
                answerOption.hashtag = localStorageData.hashtag;
                answerOptionsDoc.push(answerOption);
            });
            var exportData = {
                hashtagDoc: hashtagDoc,
                sessionDoc: sessionDoc,
                answerOptionsDoc: answerOptionsDoc,
                memberListDoc: [],
                responsesDoc: [],
            };
            var exportDataJson = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData));
            var a = document.createElement('a');
            var time = new Date();
            var timestring = time.getDate() + "_" + (time.getMonth() + 1) + "_" + time.getFullYear();
            a.href = 'data:' + exportDataJson;
            a.download = localStorageData.hashtag + "-" + timestring + ".json";
            a.innerHTML = '';
            event.target.appendChild(a);
            if (Session.get("exportReady")) {
                Session.set("exportReady", undefined);
            } else {
                Session.set("exportReady", true);
                a.click();
            }
        }
    },
    "click .js-delete": function (event) {
        var hashtagRow = $(event.currentTarget).parent().parent();
        localData.deleteHashtag(hashtagRow[0].id);
        Meteor.call('Main.deleteEverything', {privateKey: localData.getPrivateKey(), hashtag: hashtagRow[0].id});
        hashtagRow.hide();
    }
});