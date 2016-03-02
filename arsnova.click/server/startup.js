if(Meteor.isServer){
    Meteor.startup(function(){
        var hashtagsExample = {
            hashtag: "wpw",
            privateKey: "thisismypriv",
            isActive: 1
        };
        var memberListExample = [{
            hashtag: "wpw",
            nick: "Hither"
        }, {
            hashtag: "wpw",
            nick: "Metoo"
        }, {
            hashtag: "wpw",
            nick: "Nein"
        }, {
            hashtag: "wpw",
            nick: "Nerd"
        }, {
            hashtag: "wpw",
            nick: "Iron Man"
        }, {
            hashtag: "wpw",
            nick: "Deadpool"
        }];
        var sessionExample = {
            hashtag: "wpw",
            questionText: "I am a question text. This is for testing purpose. Do you understand?",
            timer: "180",
            isReadingConfirmationRequired: 0
        };
        var answerOptionsExample = [{
            hashtag: "wpw",
            answerText: "Ja",
            answerOptionNumber: 0,
            isCorrect: 1
        }, {
            hashtag: "wpw",
            answerText: "Nein",
            answerOptionNumber: 1,
            isCorrect: 0
        }];
        var responseExample = [{
            hashtag: "wpw",
            userNick: "Hither",
            answerOptionNumber: 1,
            responseTime: 30
        }, {
            hashtag: "wpw",
            userNick: "Iron Man",
            answerOptionNumber: 0,
            responseTime: 1
        }, {
            hashtag: "wpw",
            userNick: "Deadpool",
            answerOptionNumber: 1,
            responseTime: 3
        }];
        Hashtags.insert(hashtagsExample);
        AnswerOptions.insert(answerOptionsExample);
        MemberList.insert(memberListExample);
        Responses.insert(responseExample);
        Sessions.insert(sessionExample);
    });
}