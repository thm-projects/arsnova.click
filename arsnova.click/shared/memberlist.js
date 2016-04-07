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
    'MemberList.addLearner': function ({hashtag, nick, backgroundColor, foregroundColor}) {
        new SimpleSchema({
            hashtag: {type: String},
            nick: {type: String},
            backgroundColor: {type: String},
            foregroundColor: {type: String}
        }).validate({
            hashtag,
            nick,
            backgroundColor,
            foregroundColor
        });
        if (MemberList.findOne({hashtag: hashtag, nick: nick})) {
            throw new Meteor.Error('MemberList.addLearner', 'Nick already exists!');
        }
        if (Hashtags.findOne({hashtag:hashtag}).sessionStatus !== 2) {
            throw new Meteor.Error('MemberList.addLearner', 'Session is currently not available for joining');
        }
        MemberList.insert({
            hashtag: hashtag,
            nick: nick,
            lowerCaseNick: nick.toLowerCase(),
            backgroundColor: backgroundColor,
            foregroundColor: foregroundColor,
            readConfirmed: 0,
            insertDate: new Date().getTime()
        });
    },
    'MemberList.setReadConfirmed': function (hashtag, nick) {
        /*
        TODO Everybody can set "readConfirmed" for each user!
        Maybe link this method to a privateKey for learners?
        Maybe check with Meteor.user()?
         */
        new SimpleSchema({
            hashtag: {type: String},
            nick: {type: String}
        }).validate({
            hashtag,
            nick
        });
        var member = MemberList.findOne({hashtag: hashtag, nick: nick});
        if (!member) {
            throw new Meteor.Error('MemberList.setReadConfirmed', 'Member not found!');
        }
        /*
         TODO Why is member added here as options field?
         */
        MemberList.update(member._id, {$set: {readConfirmed: 1}}, member);
    },
    'MemberList.removeFromSession': function(privateKey, hashtag) {
        if(Meteor.isServer) {
            var doc = Hashtags.findOne({
                hashtag: hashtag,
                privateKey: privateKey
            });
            if (doc) {
                MemberList.remove({hashtag: hashtag});
            } else {
                throw new Meteor.Error('MemberList.removeFromSession', 'Either the hashtag isn\'t available or the key is wrong');
            }
        }
    }
});