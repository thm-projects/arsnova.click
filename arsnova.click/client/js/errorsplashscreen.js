Template.errorSplashscreen.rendered = function () {
    var splashscreen = $('.js-errorsplashscreen');
    splashscreen.on('click', function () {
        $('.js-errorsplashscreen').modal("hide");
    });
    splashscreen.modal({show: false});
};

Template.errorSplashscreen.events({
    "click #js-btn-hideErrorMessageModal": function () {
        $('.js-errorsplashscreen').modal("hide");
    }
});