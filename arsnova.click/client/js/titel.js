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

Template.titel.onRendered(function () {
    $(window).resize(function () {

        var final_height = $(window).height() - $(".navbar-fixed-top").outerHeight() - $(".navbar-fixed-bottom").outerHeight() - $(".fixed-bottom").outerHeight();
        $(".container").css("height", final_height);
        $(".container").css("margin-top", $(".navbar-fixed-top").outerHeight());

        $(".kill-session-switch-wrapper").css("top", $(".arsnova-logo").height() * 0.4);
    });
});


Template.titel.rendered = function () {
    var final_height = $(window).height() - $(".navbar-fixed-top").outerHeight() - $(".navbar-fixed-bottom").outerHeight() - $(".fixed-bottom").outerHeight();

    $(".container").css("height", final_height);
    $(".container").css("margin-top", $(".navbar-fixed-top").outerHeight());

    $(".kill-session-switch-wrapper").css("top", $(".arsnova-logo").height() * 0.4);
};