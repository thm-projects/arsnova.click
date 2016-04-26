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
import {EventManager} from '/lib/eventmanager.js';
import { AnswerOptions } from '/lib/answeroptions.js';
import * as localData from '/client/lib/local_storage.js';
import {ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import {setTimer} from './lib.js';

Template.createTimerView.events({
	"click #forwardButton, click #backButton": function (event) {
		var err = setTimer(EventManager.findOne().questionIndex);
        
		if (err) {
			new ErrorSplashscreen({
				autostart: true,
				errorMessage: TAPi18n.__("plugins.splashscreen.error.error_messages." + err.reason)
			});
		} else {
			if ($(event.currentTarget).attr("id") === "forwardButton") {

                /* After finishing question/answers - creation this function checks if there are answer-options
                 * with no text. All answer-options with no text will consequently be deleted from database and
                 * local storage to prevent the rendering of empty and therefore unnecessary answer-options during
                 * the quiz.*/
                var answers = AnswerOptions.find({answerText: { $exists: false}}).forEach(function(cursor) {
                    Meteor.call('AnswerOptions.deleteOption', {
                        privateKey: localData.getPrivateKey(),
                        hashtag: Session.get("hashtag"),
                        questionIndex: cursor.questionIndex,
                        answerOptionNumber: cursor.answerOptionNumber,
                    });
                    localData.deleteAnswerOption(Session.get("hashtag"), cursor.questionIndex, cursor.answerOptionNumber);
                });

				Meteor.call("MemberList.removeFromSession", localData.getPrivateKey(), Session.get("hashtag"));
				Meteor.call("EventManager.setActiveQuestion", localData.getPrivateKey(), Session.get("hashtag"), 0);
				Meteor.call("EventManager.setSessionStatus", localData.getPrivateKey(), Session.get("hashtag"), 2);
				Router.go("/memberlist");
			} else {
				Router.go("/answeroptions");
			}
		}
	}
});

