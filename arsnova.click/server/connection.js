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
import { EventManager } from '/lib/eventmanager.js';
import { AnswerOptions } from '/lib/answeroptions.js';
import { MemberList } from '/lib/memberlist.js';
import { Responses } from '/lib/responses.js';
import { QuestionGroup } from '/lib/questions.js';

Meteor.setInterval(function () {
    var sessionDeleteAfterIdleMinutes = 10; //Minutes to session is idle
    var now = (new Date()).getTime();
    var sessionDeleteTimeInMilliseconds = (sessionDeleteAfterIdleMinutes * 60 * 1000);
    EventManager.find({lastConnection: {$lt: (now - sessionDeleteTimeInMilliseconds)}, sessionStatus: {$ne: 0}}).forEach(function (session) {
        //Remove Session-Datas
        AnswerOptions.remove({hashtag: session.hashtag});
        MemberList.remove({hashtag: session.hashtag});
        Responses.remove({hashtag: session.hashtag});
        QuestionGroup.remove({hashtag: session.hashtag});
        EventManager.remove({hashtag: session.hashtag});
    });
}, 300000);
