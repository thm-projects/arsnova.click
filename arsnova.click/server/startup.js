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
import { Hashtags } from '/lib/hashtags.js';

if (Meteor.isServer) {
    Meteor.startup(function () {
        if (Hashtags && !Hashtags.findOne()) {

            // block this hash / pk -> do not use and merge to production server!
            var blockedHashtag1 = {
                hashtag: "hashtags",
                privateKey: new Mongo.ObjectID()._str,
                sessionStatus: 0,
                lastConnection: (new Date()).getTime()
            };
            // block this hash / pk -> do not use and merge to production server!
            var blockedHashtag2 = {
                hashtag: "privateKey",
                privateKey: new Mongo.ObjectID()._str,
                sessionStatus: 0,
                lastConnection: (new Date()).getTime()
            };

            Hashtags.insert(blockedHashtag1);
            Hashtags.insert(blockedHashtag2);
        }
    });
}