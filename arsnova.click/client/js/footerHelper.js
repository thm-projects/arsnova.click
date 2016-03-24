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
    }
})