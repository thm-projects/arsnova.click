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
        member = MemberList.findOne({
            hashtag: hashtag,
            nick: nick
        });
        if (!member) {
            if (Hashtags.findOne({hashtag:hashtag}).sessionStatus == 2) {
                MemberList.insert({
                    hashtag: hashtag,
                    nick: nick,
                    lowerCaseNick: nick.toLowerCase(),
                    backgroundColor: backgroundColor,
                    foregroundColor: foregroundColor,
                    readConfirmed: 0,
                    insertDate: new Date().getTime()
                });
            } else {
                throw new Meteor.error('MemberList.addLearner', 'Session is currently not available for joining');
            }
        } else {
            throw new Meteor.Error('MemberList.addLearner', 'Nick already exists!');
            return;
        }
    },
    'MemberList.setReadConfirmed': function (hashtag, nick) {
        // TODO Thought: maybe link this method to a privateKey for learners? otherwise everybody can set "readConfirmed" for each user!
        new SimpleSchema({
            hashtag: {type: String},
            nick: {type: String}
        }).validate({
                hashtag,
                nick
            });
        member = MemberList.findOne({
            hashtag: hashtag,
            nick: nick
        });
        if (!member) {
            throw new Meteor.Error('MemberList.setReadConfirmed', 'Member not found!');
        } else {
            MemberList.update(member._id, {$set: {readConfirmed: 1}}, member);
        }
    }
});