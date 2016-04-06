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

Meteor.publish('QuestionGroup.authorizeAsOwner', function(pprivateKey, phashtag) {
    new SimpleSchema({
        phashtag: {type: String},
        pprivateKey: {type: String}
    }).validate({
        pprivateKey,
        phashtag
    });
    var isOwner = Hashtags.find({
        hashtag: phashtag,
        privateKey: pprivateKey
    }).count();
    return isOwner > 0 ? QuestionGroup.find({hashtag: phashtag}) : null;
});

Meteor.publish('QuestionGroup.questionList', function (phashtag) {
    new SimpleSchema({
        phashtag: {type: String}
    }).validate({phashtag});
    return QuestionGroup.find({hashtag: phashtag}, {
        fields: {
            questionList: 1
        }
    });
});

Meteor.publish('QuestionGroup.memberlist', function (phashtag) {
    new SimpleSchema({
        phashtag: {type: String}
    }).validate({phashtag});
    return QuestionGroup.find({hashtag: phashtag});
});