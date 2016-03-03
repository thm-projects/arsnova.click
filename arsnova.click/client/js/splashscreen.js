/*kevin weigand, michael sann*/

Template.splashscreen.rendered = function () {
    $('.js-splashscreen').modal('show');
    $('.js-splashscreen').on('click', function () {
        $('.js-splashscreen').modal('hide')
    });

    // testweise Daten in localStorage legen
    var qq = [
        { content: "SWT 29.03" },
        { content: "SWT 29.043" },
        { content: "SWT 29.01233" },
        { content: "SWT 29.12" }
    ];
    localStorage.setItem("activeSessions", JSON.stringify(qq));

    var qq = [
        { content: "Feuerball Junge" },
        { content: "Stern" },
        { content: "Framework" }
    ];
    localStorage.setItem("answerExample", JSON.stringify(qq));


    localStorage.setItem("questionExample", "Was assoziieren Sie mit dem Wort \"Meteor\"?");

};


Template.sessionsT.helpers({
    links: JSON.parse(localStorage.getItem("activeSessions"))
});

Template.questionT.helpers({
    answ: JSON.parse(localStorage.getItem("answerExample")),
    quest:localStorage.getItem("questionExample")
});


