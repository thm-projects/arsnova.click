Template.createAnswerOptions.onCreated(function () {
   this.autorun(() => {
      this.subscription = Meteor.subscribe('AnswerOptions.instructor', localStorage.getItem("privateKey"), Session.get("hashtag"));
   });
});

Template.createAnswerOptions.helpers({
   answerOptions: function () {
      return AnswerOptions.find({}, {sort:{answerOptionNumber: 1}});
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
      const answerOption = {
         privateKey: localStorage.getItem("privateKey"),
         hashtag: Session.get("hashtag"),
         answerText: "",
         answerOptionNumber: (AnswerOptions.find().count()),
         isCorrect: 0
      };
      
      Meteor.call('AnswerOptions.addOption', answerOption);
      addAnswersToLocalStorage(answerOption);

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
         deleteAnswerOptionFromLocalStorage(Session.get("hashtag"), number);
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
         var isCorrect = $('div#answerOption-' + i + ' .check-mark-checked').length > 0 ? 1 : 0;
         Meteor.call('AnswerOptions.updateAnswerTextAndIsCorrect', {
            privateKey: localStorage.getItem("privateKey"),
            hashtag: Session.get("hashtag"),
            answerOptionNumber: i,
            answerText: text,
            isCorrect: isCorrect
         }, (err, res) => {
            if (err) {
               alert(err);
            } else {
               updateAnswerTextInLocalStorage(Session.get("hashtag"), i, text, isCorrect);
               Router.go("/readconfirmationrequired");
            }
         });
      }
   },
    "keydown .input-field": function(event){
         //Prevent tab default
         if(event.keyCode==9){
            event.preventDefault();
         }

         if(event.keyCode == 9 || event.keyCode == 13) {
            var nextElement = $(event.currentTarget).closest(".form-group").next();
            if (nextElement.length > 0) {
               nextElement.find(".input-field").focus();
            } else {
               $("#addAnswerOption").click();
            }
         }
      }
});