Template.questionList.onCreated(function () {
    if(!Session.get("questionIndex")) Session.set("questionIndex", 0);
    Session.set("valid_questions",[]);

    this.autorun(() => {
        this.subscribe('QuestionGroup.questionList', Session.get("hashtag"));
        this.subscribe('AnswerOptions.instructor', localData.getPrivateKey(), Session.get("hashtag"));
    });
});

Template.questionList.onDestroyed(function () {
    
});

Template.questionList.onRendered(function () {
    
});

Template.questionList.helpers({
    question: function () {
        var doc = QuestionGroup.findOne();
        return doc ? doc.questionList : false;
    },
    getNormalizedIndex: function (index) {
        return index + 1;
    },
    isActiveIndex: function (index) {
        return index === Session.get("questionIndex");
    },
    hasCompleteContent: function (index) {
        var valid_questions = Session.get("valid_questions");
        valid_questions[index] = checkForValidQuestions(index);
        Session.set("valid_questions",valid_questions);
        return valid_questions[index];
    }
});

Template.questionList.events({
    'click .questionIcon:not(.active)': function (event) {
        Session.set("questionIndex",parseInt($(event.target).closest(".questionIcon").attr("id").replace("questionIcon_","")));
    },
    'click .removeQuestion': function (event) {
        var id = parseInt($(event.target).closest(".questionIcon").attr("id").replace("questionIcon_",""));
        if(id > 0) Session.set("questionIndex",(id - 1));

        Meteor.call("QuestionGroup.removeQuestion", {
            privateKey: localData.getPrivateKey(),
            hashtag: Session.get("hashtag"),
            questionIndex: id
        }, (err, res) => {
            if (err) {
                $('.errorMessageSplash').parents('.modal').modal('show');
                $("#errorMessage-text").html(err.reason);
            } else {
                localData.removeQuestion(Session.get("hashtag"), id);
                var valid_questions = Session.get("valid_questions");
                valid_questions.splice(id, 1);
                Session.set("valid_questions",valid_questions);
                if (QuestionGroup.findOne().questionList.length === 0) {
                    addNewQuestion();
                }
            }
        });
    },
    'click #addQuestion': function (event) {
        addNewQuestion();
    }
});

function checkForValidQuestions(index) {
    var question = QuestionGroup.findOne().questionList[index];
    var answerDoc = AnswerOptions.find();
    if(!question || !answerDoc) return false;

    if(!question.questionText || question.questionText.length < 5) return false;
    if(!question.timer || isNaN(question.timer) || question.timer < 5000 || question.timer > 260000) return false;
    if(typeof question.isReadingConfirmationRequired === "undefined" || isNaN(question.isReadingConfirmationRequired) || question.isReadingConfirmationRequired < 0 || question.isReadingConfirmationRequired > 1) return false;

    var hasValidAnswers = false;
    var answerOptions = AnswerOptions.find({questionIndex: index}).forEach(function (value) {
        if(typeof value.answerText === "undefined" || value.answerText.length <= 500) hasValidAnswers = true;
    });
    return hasValidAnswers;
}

function addNewQuestion(){
    var index = QuestionGroup.findOne().questionList.length;
    Meteor.call("QuestionGroup.addQuestion", {
        privateKey: localData.getPrivateKey(),
        hashtag: Session.get("hashtag"),
        questionIndex: index,
        questionText: ""
    }, (err, res) => {
        if (err) {
            $('.errorMessageSplash').parents('.modal').modal('show');
            $("#errorMessage-text").html(err.reason);
        } else {
            localData.addQuestion(Session.get("hashtag"), QuestionGroup.findOne().questionList.length, "");

            var valid_questions = Session.get("valid_questions");
            valid_questions[index] = false;
            Session.set("valid_questions",valid_questions);
        }
    });
}