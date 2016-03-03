/**
 * Created by Kevin on 02.03.16.
 */
Template.createQuestionView.helpers({
    //Get question from Sessions-Collection if it already exists
    question: function() {
        //To test
        //Session.set("hashtag", "wpw");
        //window.localStorage.setItem("privateKey", "thisismypriv");

        const currentSession = Sessions.findOne({hashtag:Session.get("hashtag")});

        if(!currentSession || !currentSession.questionText) {
            return "";
        }
        return currentSession.questionText;
    }
});

Template.createQuestionView.events({
    //Save question in Sessions-Collection when Button "Next" is clicked
    "click #forwardButton":function(){
        //Validate input?
        const questionText = $('#questionText').val();

        Meteor.call("setSessionQuestion", window.localStorage.getItem("privateKey"), Session.get("hashtag"), questionText);
    },

    //Save question in Sessions-Collection when Button "Back" is clicked
    "click #backButton":function(){
        //Validate input?
        const questionText = $('#questionText').val();

        Meteor.call("setSessionQuestion", window.localStorage.getItem("privateKey"), Session.get("hashtag"), questionText);
    },
    "click #formatButton":function(){
        //Not implemented yet
    },
    "click #previewButton":function(){
        //Not implemented yet
    }
});
