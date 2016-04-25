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

Template.nick.onCreated(function () {
    this.subscribe('MemberList.members', Session.get("hashtag"));
    this.subscribe("EventManager.join",Session.get("hashtag"));
});

Template.nick.onRendered(function () {
    $("#forwardButton").attr("disabled", "disabled");
});

Template.nick.events({
    "click #forwardButton": function (event) {
        event.stopPropagation();
        var nickname = $("#nickname-input-field").val();
        var bgColor = rgbToHex(getRandomInt(0, 255), getRandomInt(0, 255), getRandomInt(0, 255));
        Meteor.call('MemberList.addLearner', {
            hashtag: Session.get("hashtag"),
            nick: nickname,
            backgroundColor: bgColor,
            foregroundColor: transformForegroundColor(hexToRgb(bgColor))
        }, (err) => {
            if (err) {
                $("#forwardButton").attr("disabled", "disabled");
                $('.errorMessageSplash').parents('.modal').modal('show');
                $("#errorMessage-text").html(err.reason);
            } else {
                Session.set("nick", nickname);
                Router.go("/memberlist");
            }
        });
    },
    "click #backButton": function () {
        Router.go("/");
    },
    'input #nickname-input-field': function (event) {
        var currentNickName = event.currentTarget.value;
        var member = MemberList.findOne({nick: currentNickName});

        if (currentNickName.length > 2 && !member && isNickAllowed(currentNickName)) {
            $("#forwardButton").removeAttr("disabled");
        } else {
            $("#forwardButton").attr("disabled", "disabled");
        }
    },
    "keydown #nickname-input-field": function(event){
        if(event.keyCode==13){
            var currentNickName = event.currentTarget.value;
            var member = MemberList.findOne({nick: currentNickName});

            if (currentNickName.length > 2 && !member) {
                $("#forwardButton").click();
            }
        }
    }
});
function isNickAllowed(nick){
	var forbiddenNicks = ["asshat","arschloch","fart","dumpfbacke","pumukel","spaten","ass","motherfucker","fucker","idiot","dumbass"];
	for(var i=0;i<forbiddenNicks.length;++i){
		if(nick.toLowerCase() === forbiddenNicks[i]){
			return false;
		}
	}
	return true;
}

function hexToRgb (hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function componentToHex (c) {
    var hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex (r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function transformForegroundColor (rgbObj) {
    var o = Math.round(((parseInt(rgbObj.r) * 299) + (parseInt(rgbObj.g) * 587) + (parseInt(rgbObj.b) * 114)) / 1000);
    return o < 125 ? "#ffffff" : "#000000";
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}