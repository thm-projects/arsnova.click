Template.createAnswerOptions.onCreated(function () {
   this.autorun(() => {
      this.subscribe('')
   });
});

Template.createAnswerOptions.helpers({
   answerOptions: function () {

   }
});