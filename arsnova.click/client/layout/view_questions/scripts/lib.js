import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import * as localData from '/client/lib/local_storage.js';

export var subscriptionHandler = null;

export function addQuestion(index) {
    var questionText = $('#questionText').val();
    Meteor.call("QuestionGroup.addQuestion", {
        privateKey: localData.getPrivateKey(),
        hashtag: Session.get("hashtag"),
        questionIndex: index,
        questionText: questionText
    }, (err) => {
        if (err) {
            $('.errorMessageSplash').parents('.modal').modal('show');
            $("#errorMessage-text").html(err.reason);
        } else {
            localData.addQuestion(Session.get("hashtag"), index, questionText);
        }
    });
}

export function calculateWindow() {
    var hashtag_length = Session.get("hashtag").length;
    var headerTitel = $(".header-titel");
    var fontSize = "";
    var marginTopModifier = 0;

    if(hashtag_length <= 10){
        if($(document).width() < 1200){
            fontSize = "6vw";
            marginTopModifier = 0.1;
        } else {
            fontSize = "5vw";
            marginTopModifier = 0.2;
        }

    } else if(hashtag_length > 10 && hashtag_length <= 15){
        fontSize = "4vw";
        marginTopModifier = 0.4;
    } else {
        fontSize = "2.5vw";
        marginTopModifier = 0.6;
    }

    headerTitel.css("font-size", fontSize);
    headerTitel.css("margin-top", $(".arsnova-logo").height() * marginTopModifier);
}