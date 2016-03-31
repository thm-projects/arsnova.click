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

Template.footer.helpers({
    isInHomePath: function () {
        return Router.current().route.path() === '/';
    },
    isBackButton: function () {
        var showHome = [
            "/",
            "agb",
            "datenschutz",
            "impressum",
            "ueber"
        ];
        var showHomeSl = [
            "/agb",
            "/datenschutz",
            "/impressum",
            "/ueber"
        ];
        return (showHomeSl.indexOf(Router.current().route.path()) !== -1) && (Session.get("lastPage") !== undefined) && (showHome.indexOf(Session.get("lastPage")) === -1) && (Router.current().route.path() !== '/');
    },
    getLastPage: function () {
        return Session.get("lastPage");
    }
});

Template.footer.events({
    "click #toPrevPage": function () {
        Session.set("lastPage", undefined);
    },
    "click #hideShowFooterBar": function () {
        if ($("#footerBar").hasClass("hide")) {
            $("#footerBar").removeClass("hide");
            $("#hideShowFooterBar").addClass("hide");
            $(".footer-info-bar").css("bottom", "15px");
            $(".footer-info-bar").css("margin-bottom", "15px");
            
            // Do nothing - there is currently no option to hide the navbar again, to loss on usable space is too high as we can display the info-button and the navbar
            /*$(".footer-info-bar").css("bottom", "15px");
            $(".footer-info-bar").css("margin-bottom", "15px");
        } else {

            $("#footerBar").addClass("hide");
            $(".footer-info-bar").css("bottom", "0px");
            $(".footer-info-bar").css("margin-bottom", "2px");*/
        }
    }
})