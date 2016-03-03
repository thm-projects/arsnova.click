Template.createAnswerOptions.onCreated(function () {
   this.autorun(() => {
      Session.set("privateKey", "thisismypriv");
      Session.set("hashtag", "wpw");
      localStorage.setItem("privateKey", "thisismypriv");
      this.subscribe('AnswerOptions.instructor', Session.get("privateKey"), Session.get("hashtag"));
   });
});

Template.createAnswerOptions.helpers({
   answerOptions: function () {
      return AnswerOptions.find();
   },
   answerOptionLetter: function (Nr) {
      return String.fromCharCode(Nr + 65);
   }
});

Template.createAnswerOptions.events({
   "click #addAnswerOption" : function () {
      var newAnswerOption = {
         hashtag: Session.get("hashtag"),
         answerText: "",
         answerOptionNumber: (AnswerOptions.find().count()),
         isCorrect: 0
      };
      Meteor.call('AnswerOptions.addOption', localStorage.getItem("privateKey"), newAnswerOption);
   },
   "click #deleteAnswerOption": function (event) {
      var number = AnswerOptions.find().count() - 1;
      Meteor.call('AnswerOptions.deleteOption', localStorage.getItem("privateKey"), Session.get("hashtag"), number);
   }
});