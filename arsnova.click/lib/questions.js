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

export const QuestionGroup = new Mongo.Collection("questionGroup");

export const SingleQuestionSchema = new SimpleSchema({
    questionText: {
        type: String,
        optional: true,
        max: 10000
    },
    timer: {
        type: Number,
        min: 0
    },
    startTime: {
        type: String,
        optional: true
    }
});

export const QuestionGroupSchema = new SimpleSchema({
    hashtag: {
        type: String,
        min: 1,
        max: 25
    },
    questionList: {
        /*
         The index is defined in the EventManager.questionIndex variable.
         The arrays index represents the questionIndex.
         */
        type: [SingleQuestionSchema]
    }
});

QuestionGroup.attachSchema(QuestionGroupSchema);