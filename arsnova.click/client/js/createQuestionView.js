/**
 * Created by Kevin on 02.03.16.
 */
Template.createQuestionView.helpers({
    question: function() {
        const currentSession = window.localStorage.getItem("session");
        if(!currentSession || !currentSession.questionText) {
            return "";
        }
        return currentSession.questionText;
    }
});

Template.createQuestionView.events({
    "click #forwardButton":function(){
        const session = window.localStorage.getItem("session");

        if(!session ||!session.hashtag) {
            return;
        }

        //Validate input?
        session.questionText = $('#questionText').val();
        window.localStorage.setItem("session", session);
    },

    "click #backButton":function(){
        const session = window.localStorage.getItem("session");

        if(!session ||!session.hashtag) {
            return;
        }

        //Validate input?
        session.questionText = $('#questionText').val();
        window.localStorage.setItem("session", session);
    },
    "click #formatButton":function(){
        //Not implemented yet
    },
    "click #previewButton":function(){
        //Not implemented yet
    }
});
