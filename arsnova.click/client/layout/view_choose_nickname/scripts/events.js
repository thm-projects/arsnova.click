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
 * along with ARSnova Click.  If not, see <http://www.gnu.org/licenses/>.*/

import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import {TAPi18n} from 'meteor/tap:i18n';
import {MemberList} from '/lib/memberlist.js';
import {ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import * as lib from './lib.js';

Template.nick.events({
    "click #forwardButton": function (event) {
        event.stopPropagation();
        var nickname = $("#nickname-input-field").val();
        var bgColor = lib.rgbToHex(lib.getRandomInt(0, 255), lib.getRandomInt(0, 255), lib.getRandomInt(0, 255));
        Meteor.call('MemberList.addLearner', {
            hashtag: Session.get("hashtag"),
            nick: nickname,
            backgroundColor: bgColor,
            foregroundColor: lib.transformForegroundColor(lib.hexToRgb(bgColor))
        }, (err) => {
            if (err) {
                $("#forwardButton").attr("disabled", "disabled");
                ErrorSplashscreen.setErrorText(TAPi18n.__("plugins.splashscreen.error.error_messages."+err.reason));
                ErrorSplashscreen.open();
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
        var $inputField = $("#nickname-input-field");
        $inputField.popover({
            title: TAPi18n.__("view.choose_nickname.nickname_na_popup"),
            trigger: 'manual',
            placement: 'bottom'
        });

        if (currentNickName.length > 2 && !member && lib.isNickAllowed(currentNickName)) {
            $("#forwardButton").removeAttr("disabled");
            $inputField.popover("destroy");
        } else {
            $("#forwardButton").attr("disabled", "disabled");
            if(currentNickName.length > 2) {
                $inputField.popover("show");
            }
        }
    },
    "keydown #nickname-input-field": function (event) {
        if (event.keyCode == 13) {
            var currentNickName = event.currentTarget.value;
            var member = MemberList.findOne({nick: currentNickName});

            if (currentNickName.length > 2 && !member) {
                $("#forwardButton").click();
            }
        }
    }
});

