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

Meteor.publish('Sessions.instructor', function(pprivateKey, phashtag) {
    new SimpleSchema({
        phashtag: {type: String},
        pprivateKey: {type: String}
    }).validate({
            pprivateKey,
            phashtag
        });
    var doc = Hashtags.find({
        hashtag: phashtag,
        privateKey: pprivateKey
    });
    if (!doc) return;
    return Sessions.find({hashtag: phashtag});
});

Meteor.publish('Sessions.question', function (phashtag) {
    new SimpleSchema({
        phashtag: {type: String}
    }).validate({phashtag});
    return Sessions.find({hashtag: phashtag}, {
        fields: {
            questionText: 1,
            startTime: 1,
            timer: 1
        }
    });
});

Meteor.publish('Sessions.memberlist', function (phashtag) {
    new SimpleSchema({
        phashtag: {type: String}
    }).validate({phashtag});
    return Sessions.find({hashtag: phashtag});
});