/*kevin weigand, michael sann*/
Template.splashscreen.rendered = function () {
    $('.js-splashscreen').modal('show');
    $('.js-splashscreen').on('click', function () {
        $('.js-splashscreen').modal('hide')
    });
}
