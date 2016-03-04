Template.splashscreen.rendered = function () {
    $('.js-splashscreen').modal('show').on('click', function () {
        $('.js-splashscreen').modal('hide')
    });
    var hashtags = ["wpw", "testing"];
    localStorage.setItem("hashtags", hashtags.toString());
    var wpwSessionData = {
        questionText: "I'm a question text. This is for testing purpose. Do you understand?",
        timer: 1800000,
        isReadingConfirmationRequired: 0
    };
    var testingSessionData = {
        questionText: "Do you like this course?",
        timer: 8000000,
        isReadingConfirmationRequired: 0
    };
    localStorage.setItem("wpw", JSON.stringify(wpwSessionData));
    localStorage.setItem("testing", JSON.stringify(testingSessionData));
};

Template.splashscreen.helpers({
    loadingTemplate: function () {
        return {template: Template[this.templateName]};
    }
});