Template.createAnswerOptions.onCreated(function () {
   this.autorun(() => {
      this.subscription = Meteor.subscribe('AnswerOptions.instructor', localData.getPrivateKey(), Session.get("hashtag"));
   });
});

Template.createAnswerOptions.helpers({
   answerOptions: function () {
      return AnswerOptions.find({}, {sort:{answerOptionNumber: 1}});
   },
   answerOptionLetter: function (Nr) {
      return String.fromCharCode(Nr + 65);
   },
   showDeleteButtonOnStart: function(){
      return (AnswerOptions.find().count()==1) ? "hide": "";
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
      if (AnswerOptions.find().count() < 26) {
         const answerOption = {
            privateKey: localData.getPrivateKey(),
            hashtag: Session.get("hashtag"),
            answerText: "",
            answerOptionNumber: (AnswerOptions.find().count()),
            isCorrect: 0
         };

         Meteor.call('AnswerOptions.addOption', answerOption, , (err, res) => {
            if (err) {
               $('.errorMessageSplash').parents('.modal').modal('show');
               $("#errorMessage-text").html(err.reason);
            }
         });


         localData.addAnswers(Session.get("hashtag"), answerOption);
         if (AnswerOptions.find().count() > 1) {
            $("#deleteAnswerOption").removeClass("hide");
         }

         if (AnswerOptions.find().count() > 25) {
            $("#addAnswerOption").addClass("hide");
         }
         $('.answer-options').scrollTop($('.answer-options')[0].scrollHeight);

      }
   },
   "click #deleteAnswerOption": function (event) {
      var number = AnswerOptions.find().count() - 1;
      if (AnswerOptions.find().count() > 1) {
         $("#addAnswerOption").removeClass("hide");

         Meteor.call('AnswerOptions.deleteOption', {
            privateKey: localData.getPrivateKey(),
            hashtag: Session.get("hashtag"),
            answerOptionNumber: number
         });
         localData.deleteAnswerOption(Session.get("hashtag"), number);
         if (AnswerOptions.find().count() == 1) {
            $("#deleteAnswerOption").addClass("hide");
         }

         if (AnswerOptions.find().count() > 2) {
            $('.answer-options').scrollTop($('.answer-options')[0].scrollHeight);
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
         var answer = {
            privateKey:localData.getPrivateKey(),
            hashtag:Session.get("hashtag"),
            answerOptionNumber: i,
            answerText:text,
            isCorrect:isCorrect};
         Meteor.call('AnswerOptions.updateAnswerTextAndIsCorrect', answer,
             (err, res) => {
            if (err) {
               alert(err);
            } else {
               Router.go("/settimer");
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
               //sets focus to the new input field
               $(event.currentTarget).closest(".form-group").next().find(".input-field").focus();
            }
         }
      }
});

Template.createAnswerOptions.onRendered(function () {
   $(window).resize(function () {
      var answer_options_height = $(".container").height() - $(".row-landingpage-buttons").outerHeight(true) - $(".titel-relative").outerHeight(true);
      $('.answer-options').css("height", answer_options_height);
   });
});


Template.createAnswerOptions.rendered = function () {
   var answer_options_height = $(".container").height() - $(".row-landingpage-buttons").outerHeight(true) - $(".titel-relative").outerHeight(true);
   $('.answer-options').css("height", answer_options_height);
};