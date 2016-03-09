localData = {
    getAllHashtags: function () {
        const hashtagString = localStorage.getItem("hashtags");
        if (!hashtagString) {
            localStorage.setItem("hashtags", JSON.stringify([]));
            return [];
        }
        return JSON.parse(hashtagString);
    },

    containsHashtag: function (hashtag) {
        if (!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
            return;
        }
        const hashtagString = localStorage.getItem("hashtags");
        if (!hashtagString) {
            return false;
        }
        return $.inArray(hashtag, JSON.parse(hashtagString));
    },

    addHashtag: function (hashtag) {
        if (!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
            return;
        }
        const hashtagString = localStorage.getItem("hashtags");
        if (!hashtagString) {
            localStorage.setItem("hashtags", JSON.stringify([hashtag]));

            localStorage.setItem(hashtag, JSON.stringify({
                hashtag: hashtag,
                questionText: "",
                timer: 40000,
                isReadingConfirmationRequired: 1,
                answers:[
                    {answerOptionNumber:0, answerText:"", isCorrect:0},
                    {answerOptionNumber:1, answerText:"", isCorrect:0},
                    {answerOptionNumber:2, answerText:"", isCorrect:0},
                    {answerOptionNumber:3, answerText:"", isCorrect:0}
                 ]
            }));
            return;
        }
        const hashtags = JSON.parse(hashtagString);
        hashtags.push(hashtag);

        localStorage.setItem("hashtags", JSON.stringify(hashtags));

        localStorage.setItem(hashtag, JSON.stringify({
            hashtag:hashtag,
            questionText:"",
            timer: 40000,
            isReadingConfirmationRequired: 1,
            answers:[
                {answerOptionNumber:0, answerText:"", isCorrect:0},
                {answerOptionNumber:1, answerText:"", isCorrect:0},
                {answerOptionNumber:2, answerText:"", isCorrect:0},
                {answerOptionNumber:3, answerText:"", isCorrect:0}
            ]
        }));
    },

    updateIsReadingConfirmationRequired: function (hashtag, isReadingConfirmationRequired) {
        if (!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
            return;
        }
        const hashtagString = localStorage.getItem(hashtag);
        if (!hashtagString) {
            return;
        }
        var hashtagData = JSON.parse(hashtagString);
        localStorage.setItem(hashtag, JSON.stringify({
            hashtag: hashtag,
            questionText: hashtagData.questionText,
            timer: hashtagData.timer,
            isReadingConfirmationRequired: isReadingConfirmationRequired,
            answers: hashtagData.answers
        }));
    },

    addQuestion: function (hashtag, question) {
        if (!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
            return;
        }
        const sessionDataString = localStorage.getItem(hashtag);
        if (!sessionDataString) {
            return;
        }
        const sessionData = JSON.parse(sessionDataString);
        sessionData.questionText = question;
        localStorage.setItem(hashtag, JSON.stringify(sessionData));
    },

    addTimer: function (hashtag, timer) {
        if (!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
            return;
        }
        const sessionDataString = localStorage.getItem(hashtag);
        if (!sessionDataString) {
            return;
        }
        const sessionData = JSON.parse(sessionDataString);
        sessionData.timer = timer;
        localStorage.setItem(hashtag, JSON.stringify(sessionData));
    },

    addAnswers : function({hashtag,  answerOptionNumber, answerText, isCorrect}){
        if(!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
            return;
        }
        const sessionDataString = localStorage.getItem(hashtag);
        if (!sessionDataString) {
            return;
        }
        const sessionData = JSON.parse(sessionDataString);
        sessionData.answers.push({
            answerOptionNumber:answerOptionNumber,
            answerText:answerText,
            isCorrect:isCorrect});
        localStorage.setItem(answer.hashtag, JSON.stringify(sessionData));
    },

    reenterSession: function (hashtag) {
        if (!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
            return;
        }
        const sessionDataString = localStorage.getItem(hashtag);
        if (!sessionDataString) {
            return;
        }
        const sessionData = JSON.parse(sessionDataString);

        if (!(typeof sessionData) === "object") {
            return;
        }

        Meteor.call("Sessions.setQuestion", {
            privateKey: localStorage.getItem("privateKey"),
            hashtag: hashtag,
            questionText: sessionData.questionText
        });

        Meteor.call("Sessions.updateIsReadConfirmationRequired", {
            privateKey: localStorage.getItem("privateKey"),
            hashtag: hashtag,
            isReadingConfirmationRequired: sessionData.isReadingConfirmationRequired
        });

        Meteor.call("Sessions.setTimer", {
            privateKey:localStorage.getItem("privateKey"),
            hashtag:hashtag,
            timer:sessionData.timer
        });

        $.each(sessionData.answers, function (key, value) {
            Meteor.call("AnswerOptions.addOption", {
                privateKey: localStorage.getItem("privateKey"),
                hashtag: hashtag,
                answerText: value.answerText,
                answerOptionNumber: value.answerOptionNumber,
                isCorrect: value.isCorrect});
        });
    },

    deleteAnswerOption: function (hashtag, answerOptionNumber) {
        if (!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
            return;
        }
        const sessionDataString = localStorage.getItem(hashtag);
        if (!sessionDataString) {
            return;
        }
        const sessionData = JSON.parse(sessionDataString);

        if (!(typeof sessionData) === "object") {
            return;
        }
        sessionData.answers = $.grep(sessionData.answers, function (value) {
            return value.answerOptionNumber != answerOptionNumber;
        });

        localStorage.setItem(hashtag, JSON.stringify(sessionData));
    },

    updateAnswerText: function ({hashtag, answerOptionNumber, answerText, isCorrect}) {
        if (!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
            return;
        }
        const sessionDataString = localStorage.getItem(hashtag);
        if (!sessionDataString) {
            return;
        }
        const sessionData = JSON.parse(sessionDataString);

        if (!(typeof sessionData) === "object") {
            return;
        }
        $.each(sessionData.answers, function (key, value) {
            if (value.answerOptionNumber === answerOptionNumber) {
                value.answerText = answerText;
                value.isCorrect = isCorrect;
            }
        });
        localStorage.setItem(hashtag, JSON.stringify(sessionData));
    },

    initializePrivateKey: function () {
        /*
         TODO: Generate privateKey
         */
        if (!localStorage.getItem("privateKey")) {
            localStorage.setItem("privateKey", "thisismypriv");
        }
    },

    getPrivateKey: function () {
        return localStorage.getItem("privateKey");
    },

    createTestData: function () {
        if (!localStorage.getItem("wpw")) {

            localStorage.setItem("wpw", JSON.stringify({
                hashtag: "wpw",
                questionText: "I am a question text. This is for testing purpose. Do you understand?",
                timer: 180000,
                isReadingConfirmationRequired: 1,
                answers: [
                    {
                        hashtag: "wpw",
                        answerText: "Ja",
                        answerOptionNumber: 0,
                        isCorrect: 1
                    },
                    {
                        hashtag: "wpw",
                        answerText: "Nein",
                        answerOptionNumber: 1,
                        isCorrect: 0
                    }
                ]
            }));
            localStorage.setItem("hashtags", JSON.stringify(["wpw"]));
        }
    }
};


