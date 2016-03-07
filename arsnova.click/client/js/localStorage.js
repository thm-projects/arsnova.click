/**
 * Created by Kevin on 07.03.16.
 */
function getAllHashtags(){
    const hashtagString = localStorage.getItem("hashtags");
    if(!hashtagString) {
        return [];
    }
    return JSON.parse(hashtagString);
}

function isHashtagInLocalStorage(hashtag){
    if(!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
        return;
    }
    const hashtagString = localStorage.getItem("hashtags");
    if(!hashtagString) {
        return false;
    }
    return $.inArray(hashtag, JSON.parse(hashtagString));
}

function addHashtagToLocalStorage(hashtag){
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
}

function addQuestionToLocalStorage(hashtag, question) {
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
}

function addTimerToLocalStorage(hashtag, timer) {
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
}

function addAnswersToLocalStorage(hashtag, answers) {
    if(!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
        return;
    }
    const sessionDataString = localStorage.getItem(hashtag);
    if(!sessionDataString) {
        return;
    }
    const sessionData = JSON.parse(sessionDataString);
    sessionData.answers = answers;
    localStorage.setItem(hashtag, JSON.stringify(sessionData));
}

function reenterSession(hashtag){
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
        isReadConfirmationRequired:sessionData.isReadConfirmationRequired
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
}

function deleteAnswerOptionFromLocalStorage(hashtag, answerOptionsNumber){
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
}

function updateAnswerTextInLocalStorage(hashtag, answerOptionNumber, answerText) {
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
}
