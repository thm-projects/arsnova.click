/*
 * This file is part of ARSnova Click.
 * Copyright (C) 2016 The ARSnova Team
 *
 * ARSnova Click is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Click is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ARSnova Click.  If not, see <http://www.gnu.org/licenses/>.
 */

Template.splashscreen.rendered = function () {
    var splashscreen = $('.js-splashscreen');
    if (templateParams.lazyClose === true) {
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
};