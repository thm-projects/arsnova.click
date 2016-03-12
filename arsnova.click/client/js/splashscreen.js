Template.splashscreen.rendered = function () {
    var splashscreen = $('.js-splashscreen');
    if (templateParams.lazyClose) {
        splashscreen.on('click', function () {
            closeSplashscreen();
        });
    } else {
        splashscreen.modal({
            backdrop: 'static',
            keyboard: false
        });
    }

    if (templateParams.noAutorun) {
        splashscreen.modal({show: false});
    } else {
        splashscreen.modal('show');
    }
};

Template.splashscreen.helpers({
    loadingTemplate: function () {
        templateParams = this;
        return {template: Template[this.templateName]};
    }
});

showSplashscreen = function () {
    $('.js-splashscreen').modal('show');
};

closeSplashscreen = function () {
    $('.js-splashscreen').modal("hide");
};

closeAndRedirectTo = function (url) {
    $('.js-splashscreen').on('hidden.bs.modal', function () {
        Router.go(url);
    }).modal('hide');
}