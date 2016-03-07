/**
 * Created by Kevin on 07.03.16.
 */
getAllHashtagsFromLocalStorage = function(){
    const hashtagString = localStorage.getItem("hashtags");
    if(!hashtagString) {
        localStorage.setItem("hashtags", JSON.stringify([]));
        return [];
    }
    return JSON.parse(hashtagString);
};

isHashtagInLocalStorage = function(hashtag){
    if(!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
        return;
    }
    const hashtagString = localStorage.getItem("hashtags");
    if(!hashtagString) {
        return false;
    }
    return $.inArray(hashtag, JSON.parse(hashtagString));
};

addHashtagToLocalStorage = function(hashtag){
    if(!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
        return;
    }
    const hashtagString = localStorage.getItem("hashtags");
    if(!hashtagString) {
        localStorage.setItem("hashtags", JSON.stringify([hashtag]));

        localStorage.setItem(hashtag, JSON.stringify({
            hashtag:hashtag,
            questionText:"",
            timer:20,
            isReadingConfirmationRequired:0,
            answers:[]
        }));
        return;
    }
    const hashtags = JSON.parse(hashtagString);
    hashtags.push(hashtag);

    localStorage.setItem("hashtags", JSON.stringify(hashtags));

    localStorage.setItem(hashtag, JSON.stringify({
        hashtag:hashtag,
        questionText:"",
        timer:20,
        isReadingConfirmationRequired:0,
        answers:[]
    }));
};

addQuestionToLocalStorage = function(hashtag, question) {
    if(!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
        return;
    }
    const sessionDataString = localStorage.getItem(hashtag);
    if(!sessionDataString) {
        return;
    }
    const sessionData = JSON.parse(sessionDataString);
    sessionData.questionText = question;
    localStorage.setItem(hashtag, JSON.stringify(sessionData));
};

addTimerToLocalStorage = function(hashtag, timer) {
    if(!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
        return;
    }
    const sessionDataString = localStorage.getItem(hashtag);
    if(!sessionDataString) {
        return;
    }
    const sessionData = JSON.parse(sessionDataString);
    sessionData.timer = timer;
    localStorage.setItem(hashtag, JSON.stringify(sessionData));
};

addAnswersToLocalStorage = function(answer){
    if(!answer.hashtag || answer.hashtag === "hashtags" || answer.hashtag === "privateKey") {
        return;
    }
    const sessionDataString = localStorage.getItem(answer.hashtag);
    if(!sessionDataString) {
        return;
    }
    const sessionData = JSON.parse(sessionDataString);
    sessionData.answers.push(answer);
    localStorage.setItem(answer.hashtag, JSON.stringify(sessionData));
};

reenterSession = function(hashtag){
    if(!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
        return;
    }
    const sessionDataString = localStorage.getItem(hashtag);
    if(!sessionDataString) {
        return;
    }
    const sessionData = JSON.parse(sessionDataString);

    if(!(typeof sessionData) === "object") {
        return;
    }

    Meteor.call("Sessions.setQuestion", {
        privateKey:localStorage.getItem("privateKey"),
        hashtag:hashtag,
        questionText:sessionData.questionText
    });

    Meteor.call("Sessions.updateIsReadConfirmationRequired", {
        privateKey:localStorage.getItem("privateKey"),
        hashtag:hashtag,
        isReadingConfirmationRequired:sessionData.isReadingConfirmationRequired
    });

    /*
        TODO:Meteor-Call für Timer

    Meteor.call("Sessions.setSessionTimer", {
        privateKey:localStorage.getItem("privateKey"),
        hashtag:hashtag,
        timer:sessionData.timer
    });
    */

    $.each(sessionData.answers, function(key, value){
        Meteor.call("AnswerOptions.addOption", {
            privateKey:localStorage.getItem("privateKey"),
            hashtag:hashtag,
            answerText:value.answerText,
            answerOptionNumber:value.answerOptionNumber,
            isCorrect:value.isCorrect
        });
    });
};

deleteAnswerOptionFromLocalStorage = function(hashtag, answerOptionsNumber){
    if(!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
        return;
    }
    const sessionDataString = localStorage.getItem(hashtag);
    if(!sessionDataString) {
        return;
    }
    const sessionData = JSON.parse(sessionDataString);

    if(!(typeof sessionData) === "object") {
        return;
    }
    sessionData.answers = $.grep(sessionData.answers, function(value){
        return value.answerOptionNumber != answerOptionsNumber;
    });

    localStorage.setItem(hashtag, JSON.stringify(sessionData));
};

updateAnswerTextInLocalStorage = function(hashtag, answerOptionNumber, answerText) {
    if(!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
        return;
    }

    const sessionDataString = localStorage.getItem(hashtag);
    if(!sessionDataString) {
        return;
    }
    const sessionData = JSON.parse(sessionDataString);

    if(!(typeof sessionData) === "object") {
        return;
    }
    $.each(sessionData.answers, function(key, value){
        if(value.answerOptionNumber === answerOptionNumber){
            value.answerText = answerText;
        }
    });

    localStorage.setItem(hashtag, JSON.stringify(sessionData));
};
