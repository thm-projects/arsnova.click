Template.createAnswerOptions.onCreated(function () {
   this.autorun(() => {
      Session.set("hashtag", "wpw");
      Session.set("isOwner", true);
      localStorage.setItem("privateKey", "thisismypriv");
      this.subscribe('AnswerOptions.instructor', localStorage.getItem("privateKey"), Session.get("hashtag"));
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
   "click .toggleCorrect": function (event) {
      if (this.isCorrect) {
         this.isCorrect = 0;
         $(event.currentTarget.firstElementChild).removeClass("check-mark-checked");
         $(event.currentTarget.firstElementChild).addClass("check-mark-unchecked");
      }
      else {
         this.isCorrect = 1;
         $(event.currentTarget.firstElementChild).removeClass("check-mark-unchecked");
         $(event.currentTarget.firstElementChild).addClass("check-mark-checked");
      }
   },
   "click #addAnswerOption": function () {
      Meteor.call('AnswerOptions.addOption', {
         privateKey: localStorage.getItem("privateKey"),
         hashtag: Session.get("hashtag"),
         answerText: "",
         answerOptionNumber: (AnswerOptions.find().count()),
         isCorrect: 0
      });
      if (AnswerOptions.find().count() > 1) {
         $("#deleteAnswerOption").show();
      }
   },
   "click #deleteAnswerOption": function (event) {
      var number = AnswerOptions.find().count() - 1;
      if (AnswerOptions.find().count() > 1) {
         Meteor.call('AnswerOptions.deleteOption', {
            privateKey: localStorage.getItem("privateKey"),
            hashtag: Session.get("hashtag"),
            answerOptionNumber: number
         });
         if (AnswerOptions.find().count() == 1) {
            $(event.target).hide();
         }
      }
   },
   "click #backButton": function (event) {
      Router.go('/question');
   },
   "click #forwardButton": function (event) {
      for (var i = 0; i < AnswerOptions.find().count(); i++) {
         var text = $("#answerOptionText_Number" + i).val();
         var checkedButton = $("#answerOption-" + i);
         Meteor.call('AnswerOptions.updateAnswerText', {
            privateKey: localStorage.getItem("privateKey"),
            hashtag: Session.get("hashtag"),
            answerOptionNumber: i,
            answerText: text
         }, (err, res) => {
            if (err) {
               alert(err);
            } else {
               Router.go("/readconfirmationrequired");
            }
         });
      }
   }
});