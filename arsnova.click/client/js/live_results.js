Template.live_results.onCreated(function () {
    this.autorun(() => {
        this.subscription = Meteor.subscribe('Responses.instructor', Session.get("hashtag"));
        this.subscription = Meteor.subscribe('AnswerOptions.options', Session.get("hashtag"));
        this.subscription = Meteor.subscribe('MemberList.members', Session.get("hashtag"));
    });
});

Template.live_results.helpers({
    result: function () {
        var result = [];
        var memberAmount = Responses.find({hashtag: Session.get("hashtag")}).fetch();
        memberAmount = _.uniq(memberAmount, false, function(user) {return user.userNick}).length;

        var answerOptions = AnswerOptions.find({hashtag: Session.get("hashtag"), isCorrect: 1}).count();
        if(answerOptions){ //survey
            AnswerOptions.find({hashtag: Session.get("hashtag")}).forEach(function(value){
                var amount = Responses.find({hashtag: Session.get("hashtag"), answerOptionNumber: value.answerOptionNumber}).count();
                result.push({name: String.fromCharCode(value.answerOptionNumber + 65), absolute: amount, percent: memberAmount ? ( Math.floor((amount * 100) / memberAmount)) : 0, isCorrect: -1});
            });
        } else { //MC / SC
            if(answerOptions === 1){ //SC
                AnswerOptions.find({hashtag: Session.get("hashtag")}).forEach(function(value){
                    var amount = Responses.find({hashtag: Session.get("hashtag"), answerOptionNumber: value.answerOptionNumber}).count();
                    result.push({name: String.fromCharCode(value.answerOptionNumber + 65), absolute: amount, percent: memberAmount ? (Math.floor((amount * 100) / memberAmount)) : 0, isCorrect: value.isCorrect});
                });

            } else { //MC
                AnswerOptions.find({hashtag: Session.get("hashtag")}).forEach(function(value){
                    var amount = Responses.find({hashtag: Session.get("hashtag"), answerOptionNumber: value.answerOptionNumber}).count();
                    result.push({name: String.fromCharCode(value.answerOptionNumber + 65), absolute: amount, percent: memberAmount ? ( Math.floor((amount * 100) / memberAmount)) : 0, isCorrect: value.isCorrect});
                });
                //TODO allAnswersCorrect/Wrong

            }
        }
        return result;
    }
});

Template.questionContentSplash.helpers({
    questionContent: function () {
        mySessions = Sessions.find();
        return mySessions;
    },
    answerContent: function () {
        answerOptions = AnswerOptions.find({hashtag: Session.get("hashtag")});
        return answerOptions;
    }
});

Template.live_results.events({
    "click #js-btn-showQuestionModal": function () {
        showSplashscreen();
    },
    "click #js-btn-showAnswerModal": function () {
        showSplashscreen();
    }

});

Template.questionContentSplash.events({
    "click #js-btn-hideQuestionModal": function () {
        closeSplashscreen();
    }
});

Template.answerContentSplash.events({
    "click #js-btn-hideAnswerModal": function () {
        closeSplashscreen();
    }
});


Template.result_button.helpers({
    getCSSClassForIsCorrect: function (isCorrect) {
        if (isCorrect > 0) {
            return 'progress-success';
        } else if (isCorrect < 0) {
            return 'progress-default';
        } else {
            return 'progress-failure';
        }
    }
});

