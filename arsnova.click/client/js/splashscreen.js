Template.splashscreen.rendered = function () {
    $('.js-splashscreen').modal('show').on('click', function () {
        $('.js-splashscreen').modal('hide')
    });

    var qq = [
        {content: "SWT 29.03"},
        {content: "SWT 29.043"},
        {content: "SWT 29.01233"},
        {content: "SWT 29.12"}
    ];
    localStorage.setItem("activeSessions", JSON.stringify(qq));

    var qq = [
        {content: "Feuerball Junge"},
        {content: "Stern"},
        {content: "Framework"}
    ];
    localStorage.setItem("answerExample", JSON.stringify(qq));


    localStorage.setItem("questionExample", "Was assoziieren Sie mit dem Wort \"Meteor\"?");

};

Template.splashscreen.loadingTemplate = function (name) {
    return {template: Template[name]};
};
