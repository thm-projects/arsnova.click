/**
 * Created by Kevin on 02.03.16.
 */
Template.createQuestionView.helpers({
    //Get question from Sessions-Collection if it already exists
    question: function () {
        //To test
        Session.set("hashtag", "wpw");
        window.localStorage.setItem("privateKey", "thisismypriv");

        const currentSession = Sessions.findOne({hashtag: Session.get("hashtag")});

        if (!currentSession || !currentSession.questionText) {
            return "";
        }
        return currentSession.questionText;
    }
});

Template.createQuestionView.events({
    //Save question in Sessions-Collection when Button "Next" is clicked
    "click #forwardButton": function () {
        var questionText = $('#questionText').val();
        Meteor.call("Sessions.setQuestion", localStorage.getItem("privateKey"), Session.get("hashtag"), questionText);
        Router.go("/answeroptions");
    }, //Save question in Sessions-Collection when Button "Back" is clicked
    "click #backButton": function () {
        var questionText = $('#questionText').val();
        Meteor.call("Sessions.setQuestion", localStorage.getItem("privateKey"), Session.get("hashtag"), questionText);
        Session.set("isOwner", undefined);
        Router.go("/");
    },
    "click #formatButton": function () {
        //Not implemented yet
    },
    "click #previewButton": function () {
        //Not implemented yet
    }
});
