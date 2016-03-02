/**
 * Created by Kevin on 02.03.16.
 */
Template.createQuestionView.helpers({
    question: function() {
        const session = Session.get("currentSession");
        if(!session || !session.hashtag || !session.questionText) {
            return "";
        }
        return session.questionText;
    }
});

Template.createQuestionView.events({
    "click #forwardButton":function(){
        const session = Session.get("currentSession");
        if(!session ||!session.hashtag) {
            return;
        }

        //Validate input?
        session.questionText = $('#questionText').val();
        Session.set("currentsession", session);
    },

    "click #backButton":function(){
        const session = Session.get("currentSession");
        if(!session ||!session.hashtag) {
            return;
        }

        //Validate input?
        session.questionText = $('#questionText').val();
        Session.set("currentsession", session);
    },
    "click #formatButton":function(){
        //Not implemented yet
    },
    "click #previewButton":function(){
        //Not implemented yet
    }
});
