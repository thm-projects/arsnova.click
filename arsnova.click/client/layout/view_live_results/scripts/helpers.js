import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { EventManager } from '/lib/eventmanager.js';
import { AnswerOptions } from '/lib/answeroptions.js';
import { MemberList } from '/lib/memberlist.js';
import { Responses } from '/lib/responses.js';
import { QuestionGroup } from '/lib/questions.js';
import { countdown, getPercentRead, getCurrentRead, hsl_col_perc, checkIfIsCorrect } from './lib.js';

Template.live_results.helpers({
    votingText: function () {
        return Session.get("sessionClosed") ? "Game over" : "Countdown";
    },
    isOwner: function () {
        return Session.get("isOwner");
    },
    getCountdown: function () {
        if (Session.get("countdownInitialized")) {
            var roundedCountdown = Math.round(countdown.get());
            return roundedCountdown < 0 ? 0 : roundedCountdown;
        }
        return 0;
    },
    isCountdownZero: function (index) {
        if (Session.get("isOwner")) {
            if (Session.get("sessionClosed") || !Session.get("countdownInitialized") || EventManager.findOne().questionIndex !== index) {
                return true;
            } else {
                var timer = Math.round(countdown.get());
                return timer <= 0;
            }
        } else {
            var question = QuestionGroup.findOne().questionList[EventManager.findOne().questionIndex];
            
            if (EventManager.findOne().questionIndex === index && new Date().getTime() - parseInt(question.startTime) < question.timer) {
                return false;
            } else {
                return true;
            }
        }
    },
    getCountStudents: function () {
        return MemberList.find().count();
    },
    getPercentRead: (index)=> {
        return getPercentRead(index);
    },
    getCurrentRead: (index)=> {
        return getCurrentRead(index);
    },
    sessionClosed: function () {
        return Session.get("sessionClosed");
    },
    showLeaderBoardButton: function (index) {
        return !Session.get("countdownInitialized") && (AnswerOptions.find({
                questionIndex: index,
                isCorrect: 1
            }).count() > 0);
    },
    isMC: function (index) {
        return AnswerOptions.find({
                questionIndex: index,
                isCorrect: 1
            }).count() > 1;
    },
    mcOptions: function (index) {
        let memberAmount = Responses.find({questionIndex: index}).fetch();
        memberAmount = _.uniq(memberAmount, false, function (user) {
            return user.userNick;
        }).length;

        const correctAnswers = [];
        AnswerOptions.find({
            questionIndex: index,
            isCorrect: 1
        }, {fields: {"answerOptionNumber": 1}}).forEach(function (answer) {
            correctAnswers.push(answer.answerOptionNumber);
        });
        let allCorrect = 0;
        let allWrong = 0;
        MemberList.find().forEach(function (user) {
            let responseAmount = 0;
            let everythingRight = true;
            let everythingWrong = true;
            Responses.find({
                questionIndex: index,
                userNick: user.nick
            }).forEach(function (response) {
                if ($.inArray(response.answerOptionNumber, correctAnswers) !== -1) {
                    everythingWrong = false;
                } else {
                    everythingRight = false;
                }
                responseAmount++;
            });
            if (responseAmount) {
                if (everythingRight && responseAmount === correctAnswers.length) {
                    allCorrect++;
                }
                if (everythingWrong) {
                    allWrong++;
                }
            }
        });
        return {
            allCorrect: {
                absolute: allCorrect,
                percent: memberAmount ? Math.floor((allCorrect * 100) / memberAmount) : 0
            },
            allWrong: {
                absolute: allWrong,
                percent: memberAmount ? Math.floor((allWrong * 100) / memberAmount) : 0
            }
        };
    },
    getNormalizedIndex: function (index) {
        return index + 1;
    },
    allQuestionCount: function () {
        var doc = QuestionGroup.findOne();
        return doc ? doc.questionList.length : false;
    },
    questionList: function () {
        var questionDoc = QuestionGroup.findOne();
        if (!questionDoc) {
            return;
        }

        var questionList = questionDoc.questionList;
        if (EventManager.findOne().readingConfirmationIndex < questionList.length - 1) {
            questionList.splice(EventManager.findOne().readingConfirmationIndex + 1, questionList.length - (EventManager.findOne().readingConfirmationIndex + 1));
        }

        for (var i = 0; i < questionList.length; i++) {
            questionList[i].displayIndex = i;
        }

        return questionList ? questionList.reverse() : false;
    },
    answerList: function (index) {
        var result = [];
        var memberAmount = Responses.find({questionIndex: index}).fetch();
        memberAmount = _.uniq(memberAmount, false, function (user) {
            return user.userNick;
        }).length;

        var correctAnswerOptions = AnswerOptions.find({
            questionIndex: index,
            isCorrect: 1
        }).count();
        AnswerOptions.find({questionIndex: index}, {sort: {'answerOptionNumber': 1}}).forEach(function (value) {
            var amount = Responses.find({
                questionIndex: index,
                answerOptionNumber: value.answerOptionNumber
            }).count();
            result.push({
                name: String.fromCharCode(value.answerOptionNumber + 65),
                absolute: amount,
                percent: memberAmount ? (Math.floor((amount * 100) / memberAmount)) : 0,
                isCorrect: correctAnswerOptions ? value.isCorrect : -1,
                questionIndex: index
            });
        });
        return result;
    },
    isActiveQuestion: function (index) {
        return !Session.get("sessionClosed") && index === EventManager.findOne().questionIndex;
    },
    isRunningQuestion: ()=> {
        return Session.get("countdownInitialized");
    },
    showNextQuestionButton: ()=> {
        if (EventManager.findOne() && EventManager.findOne().readingConfirmationIndex <= EventManager.findOne().questionIndex) {
            return true;
        }
    },
    nextQuestionIndex: ()=> {
        return EventManager.findOne() ? EventManager.findOne().questionIndex + 2 : false;
    },
    nextReadingConfirmationIndex: ()=> {
        return EventManager.findOne() ? EventManager.findOne().readingConfirmationIndex + 2 : false;
    },
    getCSSClassForPercent: (percent)=> {
        return hsl_col_perc(percent, 0, 100);
    },
    showGlobalLeaderboardButton: ()=> {
        var questionDoc = QuestionGroup.findOne();
        if (!questionDoc) {
            return;
        }

        return Session.get("sessionClosed") || EventManager.findOne().questionIndex >= questionDoc.questionList.length - 1;
    },
    hasCorrectAnswerOptions: ()=> {
        return AnswerOptions.find({isCorrect: 1}).count() > 0;
    },
    showQuestionDialog: ()=> {
        if (!EventManager.findOne()) {
            return;
        }

        return EventManager.findOne().questionIndex === EventManager.findOne().readingConfirmationIndex;
    },
    hasReadConfirmationRequested: (index)=> {
        return index <= EventManager.findOne().questionIndex;
    },
    readingConfirmationListForQuestion: (index)=> {
        let result = [];
        let sortParamObj = Session.get('LearnerCountOverride') ? {lowerCaseNick: 1} : {insertDate: -1};
        let ownNick = MemberList.findOne({nick: Session.get("nick")}, {limit: 1});
        if (!Session.get("isOwner") && ownNick.readConfirmed[index]) {
            result.push(ownNick);
        }
        MemberList.find({nick: {$ne: Session.get("nick")}}, {
            sort: sortParamObj
        }).forEach(function (doc) {
            if (result.length < Session.get("LearnerCount") && doc.readConfirmed[index]) {
                result.push(doc);
            }
        });
        return result;
    },
    isOwnNick: (nick)=> {
        return nick === Session.get("nick");
    },
    showMoreButton: function (index) {
        var result = [];
        MemberList.find().forEach(function (doc) {
            if (doc.readConfirmed[index]) {
                result.push(doc);
            }
        });
        return ((result.length - Session.get("LearnerCount")) > 1);
    },
    invisibleLearnerCount: function (index) {
        var result = [];
        MemberList.find().forEach(function (doc) {
            if (doc.readConfirmed[index]) {
                result.push(doc);
            }
        });
        return result.length - Session.get("LearnerCount");
    }
});

Template.result_button.helpers({
    getCSSClassForIsCorrect: checkIfIsCorrect
});

Template.result_button_mc.helpers({
    getCSSClassForIsCorrect: checkIfIsCorrect
});

Template.readingConfirmedLearner.helpers({
    isOwnNick: function (nickname) {
        return nickname === Session.get("nick");
    }
});