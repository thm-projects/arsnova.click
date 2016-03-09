Template.endOfPollingSplashscreen.rendered = function () {
    var splashscreen = $('.js-splashscreen-end-of-polling');
    splashscreen.modal({
        backdrop: 'static',
        keyboard: false,
        show: false
    });
};

Template.endOfPollingSplashscreen.events({
    "click #js-btn-hideEndOfPollingModal": function () {
        $('.js-splashscreen-end-of-polling').modal("hide");
        Router.go("/results");
    }
});