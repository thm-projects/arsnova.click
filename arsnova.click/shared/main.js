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

import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { EventManager } from '/lib/eventmanager.js';
import { AnswerOptions } from '/lib/answeroptions.js';
import { MemberList } from '/lib/memberlist.js';
import { Responses } from '/lib/responses.js';
import { QuestionGroup } from '/lib/questions.js';
import { Hashtags } from '/lib/hashtags.js';

Meteor.methods({
    'Main.killAll': function (privateKey, hashtag) {
        if (Meteor.isServer){
            new SimpleSchema({
                hashtag: {type: String},
                privateKey: {type: String}
            }).validate({
                privateKey,
                hashtag
            });
            var doc = Hashtags.findOne({
                hashtag: hashtag,
                privateKey: privateKey
            });
            if (doc) {
                Meteor.call('EventManager.reset', privateKey, doc.hashtag, function () {
                    AnswerOptions.remove({hashtag: doc.hashtag});
                    MemberList.remove({hashtag: doc.hashtag});
                    Responses.remove({hashtag: doc.hashtag});
                    QuestionGroup.remove({hashtag: doc.hashtag});
                });
            }
        }
    },
    'Main.deleteEverything': function ({privateKey, hashtag}) {
        if (Meteor.isServer) {
            var hashtagDoc = Hashtags.findOne({hashtag: hashtag, privateKey: privateKey});
            if (typeof hashtagDoc === "undefined") {
                throw new Meteor.Error('Main.deleteEverything', 'plugins.splashscreen.error.error_messages.not_authorized');
            }
            Hashtags.remove({hashtag: hashtag});
            AnswerOptions.remove({hashtag: hashtag});
            MemberList.remove({hashtag: hashtag});
            Responses.remove({hashtag: hashtag});
            QuestionGroup.remove({hashtag: hashtag});
            EventManager.remove({hashtag: hashtag});
        }
    }
});