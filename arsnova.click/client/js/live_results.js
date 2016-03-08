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
        var memberAmount = MemberList.find({hashtag: Session.get("hashtag")}).count();
        var answerOptions = AnswerOptions.find({hashtag: Session.get("hashtag"), isCorrect: 1}).count();
        if(false && answerOptions){ //survey
            console.log('Umfrage');
            console.log(AnswerOptions.find({hashtag: Session.get("hashtag")}).fetch());
            AnswerOptions.find({hashtag: Session.get("hashtag")}).forEach(function(value){
                console.log(value);
                var amount = Responses.find({hashtag: Session.get("hashtag"), answerOptionNumber: value.answerOptionNumber}).count();
                result.push({name: String.fromCharCode(value.answerOptionNumber + 65), absolute: amount, percent: '0', isCorrect: 1});
            });
        } else { //MC / SC
            if(answerOptions === 1){ //SC
                AnswerOptions.find({hashtag: Session.get("hashtag")}).forEach(function(value){
                    console.log(value);
                    var amount = Responses.find({hashtag: Session.get("hashtag"), answerOptionNumber: value.answerOptionNumber}).count();
                    result.push({name: String.fromCharCode(value.answerOptionNumber + 65), absolute: amount, percent: Math.floor((amount * 100) / memberAmount), isCorrect: value.isCorrect});
                });

            } else { //MC

            }
        }
        console.log(result);
        return result;
    }
});

Template.live_results.events({
    //Save question in Sessions-Collection when Button "Next" is clicked
    "click #showQuestion": function () {


    }

});
