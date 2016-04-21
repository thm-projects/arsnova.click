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

import * as localData from '../../lib/local_storage.js';

Template.modalShowMyHashtags.helpers({
    hashtags: function () {
        return localData.getAllHashtags();
    }
});

Template.modalShowMyHashtags.events({
    "click .js-my-hash": function (event) {
        var hashtag = event.target.text;
        Session.set("isOwner", true);
        Session.set("hashtag", hashtag);
        localData.reenterSession(hashtag);
        Meteor.call('EventManager.add', localData.getPrivateKey(), hashtag, function () {
            closeAndRedirectTo('/question');
        });
    },
    "click #js-btn-showHashtagManagement": function () {
        closeAndRedirectTo('/hashtagmanagement');
    }
});