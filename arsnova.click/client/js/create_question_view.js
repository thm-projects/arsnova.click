Template.createQuestionView.onCreated(function () {
    this.autorun(() => {
        this.subscribe('Sessions.instructor', localData.getPrivateKey(), Session.get("hashtag"), function () {
            var sessionDoc = Sessions.findOne({hashtag: Session.get("hashtag")});
            if (sessionDoc && sessionDoc.questionText.length > 4) {
                $("#forwardButton").removeAttr("disabled");
            }
            else {
                $("#forwardButton").attr("disabled", "disabled");
            }
        });
    });
});

Template.createQuestionView.helpers({
    //Get question from Sessions-Collection if it already exists
    questionText: function () {
        var currentSession = Sessions.findOne({hashtag: Session.get("hashtag")});
        if (currentSession) {
            return currentSession.questionText;
        }
        else {
            return "";
        }
    },
});

Template.createQuestionView.events({
    "input #questionText": function (event) {
        var questionText = event.currentTarget.value;
        if (questionText.length > 4) {
            $("#forwardButton").removeAttr("disabled");
        } else {
            $("#forwardButton").attr("disabled", "disabled");
        }
    },
    //Save question in Sessions-Collection when Button "Next" is clicked
    'click #forwardButton': function () {
        var questionText = $('#questionText').val();
        Meteor.call("Sessions.setQuestion", {
            privateKey: localData.getPrivateKey(),
            hashtag: Session.get("hashtag"),
            questionText: questionText
        }, (err, res) => {
            if (err) {
                $('.errorMessageSplash').parents('.modal').modal('show');
                $("#errorMessage-text").html(err.reason);
            } else {
                localData.addQuestion(Session.get("hashtag"), questionText);
                Router.go("/answeroptions");
            }
        });
    },
    "click #backButton": function () {
        var questionText = $('#questionText').val();
        Session.set("hashtag", undefined);
        Session.set("isOwner", undefined);
        Router.go("/");
        $('.previewSplash').parents('.modal').modal('hide');
    },
    "click #formatButton": function () {
        //Not implemented yet
    },
    "click #previewButton": function () {
        $('.previewSplash').parents('.modal').modal('show');
        $("#modalpreview-text").html($('#questionText').val());
    }
});
