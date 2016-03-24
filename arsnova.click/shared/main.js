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
                Hashtags.update(doc._id, {$set:{sessionStatus : 0}});
                AnswerOptions.remove({hashtag: doc.hashtag});
                MemberList.remove({hashtag: doc.hashtag});
                Responses.remove({hashtag: doc.hashtag});
                Sessions.remove({hashtag: doc.hashtag});
            }
        }
    },
    'Main.deleteEverything': function ({privateKey, hashtag}) {
        if (Meteor.isServer) {
            var hashtagDoc = Hashtags.findOne({hashtag: hashtag, privateKey: privateKey});
            if (!hashtagDoc) {
                throw new Meteor.Error('Main.deleteEverything', 'Either the hashtag isn\'t available or the key is wrong');
                return;
            }
            Hashtags.remove({hashtag: hashtag});
            AnswerOptions.remove({hashtag: doc.hashtag});
            MemberList.remove({hashtag: doc.hashtag});
            Responses.remove({hashtag: doc.hashtag});
            Sessions.remove({hashtag: doc.hashtag});
        }
    }
});