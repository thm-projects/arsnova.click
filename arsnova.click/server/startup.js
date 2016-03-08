if(Meteor.isServer){
    Meteor.startup(function(){
        if (!Hashtags.findOne()) {
            var hashtagsExample = {
                hashtag: "wpw",
                privateKey: "thisismypriv",
                isActive: 1
            };
            // block this hash / pk -> do not use and merge to production server!
            var hashtagsExample2 = {
                hashtag: "hashtags",
                privateKey: "äölkjhgfdsaq",
                isActive: 1
            };
            // block this hash / pk -> do not use and merge to production server!
            var hashtagsExample3 = {
                hashtag: "privateKey",
                privateKey: "poiuztrewqas",
                isActive: 1
            };
            var memberListExample1 = {
                hashtag: "wpw",
                nick: "Testuser",
                readConfirmed: 1
            };
            var memberListExample2 = {
                hashtag: "wpw",
                nick: "Metoo",
                readConfirmed: 1
            };
            var memberListExample3 = {
                hashtag: "wpw",
                nick: "Nein",
                readConfirmed: 0
            };
            var memberListExample4 = {
                hashtag: "wpw",
                nick: "Nerd",
                readConfirmed: 0
            };
            var memberListExample5 = {
                hashtag: "wpw",
                nick: "Iron Man",
                readConfirmed: 0
            };
            var memberListExample6 = {
                hashtag: "wpw",
                nick: "Deadpool",
                readConfirmed: 0
            };
            var sessionExample = {
                hashtag: "wpw",
                questionText: "I am a question text. This is for testing purpose. Do you understand?",
                timer: "180",
                isReadingConfirmationRequired: 1
            };
            var answerOptionsExample1 = {
                hashtag: "wpw",
                answerText: "Ja",
                answerOptionNumber: 0,
                isCorrect: 1
            };
            var answerOptionsExample2 = {
                hashtag: "wpw",
                answerText: "Nein",
                answerOptionNumber: 1,
                isCorrect: 0
            };
            var responseExample1 = {
                hashtag: "wpw",
                userNick: "Hither",
                answerOptionNumber: 1,
                responseTime: 30
            };
            var responseExample2 = {
                hashtag: "wpw",
                userNick: "Iron Man",
                answerOptionNumber: 0,
                responseTime: 1
            };
            var responseExample3 = {
                hashtag: "wpw",
                userNick: "Deadpool",
                answerOptionNumber: 1,
                responseTime: 3
            };

            Hashtags.insert(hashtagsExample);
            Hashtags.insert(hashtagsExample2);
            Hashtags.insert(hashtagsExample3);
            Sessions.insert(sessionExample);
            Responses.insert(responseExample1);
            Responses.insert(responseExample2);
            Responses.insert(responseExample3);
            AnswerOptions.insert(answerOptionsExample1);
            AnswerOptions.insert(answerOptionsExample2);
            MemberList.insert(memberListExample1);
            MemberList.insert(memberListExample2);
            MemberList.insert(memberListExample3);
            MemberList.insert(memberListExample4);
            MemberList.insert(memberListExample5);
            MemberList.insert(memberListExample6);
        }
    });
}