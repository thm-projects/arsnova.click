/*
 * This file is part of ARSnova Click.
 * Copyright (C) 2016 The ARSnova Team
 *
 * ARSnova Click is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Click is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ARSnova Click.  If not, see <http://www.gnu.org/licenses/>.
 */

localData = {
    getAllHashtags: function () {
        var hashtagString = localStorage.getItem("hashtags");
        if (!hashtagString) {
            localStorage.setItem("hashtags", JSON.stringify([]));
            return [];
        }
        return JSON.parse(hashtagString).sort();
    },

    containsHashtag: function (hashtag) {
        if (!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
            return;
        }
        const hashtagString = localStorage.getItem("hashtags");
        return hashtagString ? $.inArray(hashtag, JSON.parse(hashtagString)) : false;
    },

    deleteHashtag: function (hashtag) {
        if (!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
            return;
        }
        var allHashtags = JSON.parse(localStorage.getItem("hashtags"));
        if (!allHashtags) {
            return false;
        }
        var index = $.inArray(hashtag, allHashtags);
        if (index > -1) {
            localStorage.removeItem(hashtag);
            localStorage.setItem("hashtags", JSON.stringify(allHashtags));
        }
    },

    addHashtag: function (hashtag) {
        if (!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
            return;
        }
        var questionObject = {
            hashtag:hashtag,
            questionList: [
                {
                    questionText: "",
                    timer: 40000,
                    answers: [
                        {answerOptionNumber:0, answerText:"", isCorrect:0},
                        {answerOptionNumber:1, answerText:"", isCorrect:0},
                        {answerOptionNumber:2, answerText:"", isCorrect:0},
                        {answerOptionNumber:3, answerText:"", isCorrect:0}
                    ]
                }
            ]
        };
        const hashtagString = localStorage.getItem("hashtags");
        if (!hashtagString) {
            localStorage.setItem("hashtags", JSON.stringify([hashtag]));
            localStorage.setItem(hashtag, JSON.stringify(questionObject));
        } else {
            const hashtags = JSON.parse(hashtagString);
            hashtags.push(hashtag);

            localStorage.setItem("hashtags", JSON.stringify(hashtags));
            localStorage.setItem(hashtag, JSON.stringify(questionObject));
        }
    },

    addQuestion: function (hashtag, question) {
        if (!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
            return;
        }
        const sessionDataString = localStorage.getItem(hashtag);
        if (sessionDataString) {
            const sessionData = JSON.parse(sessionDataString);
            if(questionIndex < sessionData.questionList.length) {
                sessionData.questionList[questionIndex].questionText = questionText;
            } else {
                sessionData.questionList.push({
                    questionText: questionText,
                    timer: 10000,
                    isReadingConfirmationRequired: 1,
                    answers: [
                        {answerOptionNumber:0, answerText:"", isCorrect:0},
                        {answerOptionNumber:1, answerText:"", isCorrect:0},
                        {answerOptionNumber:2, answerText:"", isCorrect:0},
                        {answerOptionNumber:3, answerText:"", isCorrect:0}
                    ]
                });
            }
            localStorage.setItem(hashtag, JSON.stringify(sessionData));
        }
    },

    removeQuestion: function (hashtag, questionIndex) {
        if (!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
            return;
        }
        const sessionDataString = localStorage.getItem(hashtag);
        if (sessionDataString) {
            const sessionData = JSON.parse(sessionDataString);
            sessionData.questionList.splice(questionIndex, 1);
            localStorage.setItem(hashtag, JSON.stringify(sessionData));
        }
    },

    addTimer: function (hashtag, questionIndex, timer) {
        if (!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
            return;
        }
        const sessionDataString = localStorage.getItem(hashtag);
        if (sessionDataString) {
            const sessionData = JSON.parse(sessionDataString);
            sessionData.questionList[questionIndex].timer = timer;
            localStorage.setItem(hashtag, JSON.stringify(sessionData));
        }
    },

    addAnswers : function({hashtag, questionIndex, answerOptionNumber, answerText, isCorrect}){
        if(!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
            return;
        }
        const sessionDataString = localStorage.getItem(hashtag);
        if (sessionDataString) {
            const sessionData = JSON.parse(sessionDataString);
            if(!sessionData.questionList[questionIndex].answers) {
                sessionData.questionList[questionIndex].answers = [];
            }
            sessionData.questionList[questionIndex].answers.push({
                answerOptionNumber:answerOptionNumber,
                answerText:answerText,
                isCorrect:isCorrect
            });
            localStorage.setItem(hashtag, JSON.stringify(sessionData));
        }
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

        if (typeof sessionData === "object") {
            /*
            This supports the "old" question format where one question was bound to one hashtag.
            It saves the content of the question to the new questionList and deletes the invalid keys.
            TODO: remove later when it is likely that there are no more sessions with the old question format
             */
            if(typeof sessionData.questionList === "undefined") {
                sessionData.questionList = [{
                    questionText: sessionData.questionText,
                    timer: sessionData.timer,
                    isReadingConfirmationRequired: sessionData.isReadingConfirmationRequired,
                    answers: sessionData.answers
                }];
                delete sessionData.questionText;
                delete sessionData.timer;
                delete sessionData.isReadingConfirmationRequired;
                delete sessionData.answers;
                localStorage.setItem(hashtag, JSON.stringify(sessionData));
            }

            for(var i = 0; i < sessionData.questionList.length; i++) {
                if(!sessionData.questionList[i].answers) continue;
                var answer = sessionData.questionList[i].answers;
                delete sessionData.questionList[i].answers;
                for(var j = 0; j< answer.length; j++) {
                    Meteor.call("AnswerOptions.addOption", {
                        privateKey: localStorage.getItem("privateKey"),
                        hashtag: hashtag,
                        questionIndex: i,
                        answerText: answer[j].answerText,
                        answerOptionNumber: answer[j].answerOptionNumber,
                        isCorrect: answer[j].isCorrect
                    });
                }
            }
            Meteor.call("QuestionGroup.insert", {
                privateKey: localStorage.getItem("privateKey"),
                hashtag: hashtag,
                questionList: sessionData.questionList
            });
        }
    },

    deleteAnswerOption: function (hashtag, questionIndex, answerOptionNumber) {
        if (!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
            return;
        }
        const sessionDataString = localStorage.getItem(hashtag);
        if (!sessionDataString) {
            return;
        }

        const sessionData = JSON.parse(sessionDataString);
        if (typeof sessionData === "object") {
            sessionData.questionList[questionIndex].answers = $.grep(sessionData.questionList[questionIndex].answers, function (value) {
                return value.answerOptionNumber !== answerOptionNumber;
            });

            localStorage.setItem(hashtag, JSON.stringify(sessionData));
        }
    },

    updateAnswerText: function ({hashtag, questionIndex, answerOptionNumber, answerText, isCorrect}) {
        if (!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
            return;
        }
        const sessionDataString = localStorage.getItem(hashtag);
        if (!sessionDataString) {
            return;
        }

        const sessionData = JSON.parse(sessionDataString);
        if (typeof sessionData === "object") {
            $.each(sessionData.questionList[questionIndex].answers, function (key, value) {
                if (value.answerOptionNumber === answerOptionNumber) {
                    value.answerText = answerText;
                    value.isCorrect = isCorrect;
                }
            });
            localStorage.setItem(hashtag, JSON.stringify(sessionData));
        }
    },

    initializePrivateKey: function () {
        if (!localStorage.getItem("privateKey")) {
            localStorage.setItem("privateKey", new Mongo.ObjectID()._str);
        }
    },

    getPrivateKey: function () {
        return localStorage.getItem("privateKey");
    },

    importFromFile: function (data) {
        var hashtag = data.hashtagDoc.hashtag;
        if ((hashtag === "hashtags") || (hashtag === "privateKey")) {
            return;
        }

        var allHashtags = JSON.parse(localStorage.getItem("hashtags"));
        allHashtags = $.grep(allHashtags, function (value) {
            return value !== data.hashtagDoc.hashtag;
        });
        allHashtags.push(hashtag);
        localStorage.setItem("hashtags", JSON.stringify(allHashtags));

        var questionList = [];
        data.sessionDoc.forEach(function (questionListDoc) {
            var answerOptionsLocalStorage = [];
            data.answerOptionsDoc.forEach(function (answerOptionDoc) {
                answerOptionsLocalStorage.push({
                    answerOptionNumber: answerOptionDoc.answerOptionNumber,
                    answerText: answerOptionDoc.answerText,
                    isCorrect: answerOptionDoc.isCorrect
                });
            });

            questionList.push({
                questionText: questionListDoc.questionText,
                timer: questionListDoc.timer,
                isReadingConfirmationRequired: questionListDoc.isReadingConfirmationRequired,
                answers: answerOptionsLocalStorage
            });
        });

        localStorage.setItem(
            hashtag,
            JSON.stringify({
                hashtag: data.hashtagDoc.hashtag,
                questionList: questionList
            })
        );
    },

    exportFromLocalStorage: function (hashtag) {
        var localStorageData = JSON.parse(localStorage.getItem(hashtag));
        if (localStorageData) {
            var hashtagDoc = {
                hashtag: localStorageData.hashtag,
                sessionStatus: 0,
                lastConnection: 0
            };
            var sessionDoc = [];
            localStorageData.questionList.forEach(function (question) {
                answerOptionsDoc.push(question);
            });
            var answerOptionsDoc = [];
            localStorageData.answers.forEach(function (answerOption) {
                // TODO: Is it required to save the hashtag to the answers? We can always access the hashtag in the top level object index (localstorageItem.hashtag)
                answerOption.hashtag = localStorageData.hashtag;
                answerOptionsDoc.push(answerOption);
            });

            return JSON.stringify({
                hashtagDoc: hashtagDoc,
                sessionDoc: sessionDoc,
                answerOptionsDoc: answerOptionsDoc,
                memberListDoc: [],
                responsesDoc: []
            });
        }
    },

    createTestData: function () {
        if (!localStorage.getItem("wpw")) {

            localStorage.setItem("wpw", JSON.stringify({
                hashtag: "wpw",
                questionList: [
                    {
                        questionText: "I am a question text. This is for testing purpose. Do you understand?",
                        timer: 180000,
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
                    },
                    {
                        questionText: "I am a second question text. This is for testing purpose. Do you understand?",
                        timer: 10000,
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
                            },
                            {
                                hashtag: "wpw",
                                answerText: "Vielleicht",
                                answerOptionNumber: 2,
                                isCorrect: 0
                            }
                        ]
                    }
                ]
            }));
            localStorage.setItem("hashtags", JSON.stringify(["wpw"]));
        }
    }
};


