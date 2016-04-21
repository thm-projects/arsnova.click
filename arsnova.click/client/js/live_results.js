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

var countdown = null;
var routeToLeaderboardTimer = null;
var eventManagerObserver = null;
var readingConfirmationTracker = null;

Template.live_results.onCreated(function () {
    var oldStartTimeValues = {};
    var initQuestionIndex = -1;
    countdown = null;

    this.subscribe('EventManager.join', Session.get("hashtag"), function(){
        initQuestionIndex = EventManager.findOne().questionIndex;
        eventManagerObserver = EventManager.find().observeChanges({
            changed: function (id, changedFields) {
                if(!isNaN(changedFields.sessionStatus)){
                    if(changedFields.sessionStatus === 2) {
                        $('.modal-backdrop').remove();
                        eventManagerObserver.stop();
                        Router.go("/memberlist");
                    } else if(changedFields.sessionStatus < 2) {
                        $('.modal-backdrop').remove();
                        eventManagerObserver.stop();
                        Router.go("/resetToHome");
                    }
                } else if(!isNaN(changedFields.questionIndex) && changedFields.questionIndex !== initQuestionIndex) {
                    if(Session.get("isOwner")) {
                        mathjaxMarkdown.initializeMarkdownAndLatex();
                        $('.answerTextSplash').parents('.modal').modal();
                        var content = "";
                        AnswerOptions.find({questionIndex: EventManager.findOne().questionIndex}, {sort:{answerOptionNumber: 1}}).forEach(function (answerOption) {
                            if(!answerOption.answerText) {
                                answerOption.answerText = "";
                            }

                            content += String.fromCharCode((answerOption.answerOptionNumber + 65)) + "<br/>";
                            content += mathjaxMarkdown.getContent(answerOption.answerText) + "<br/>";
                        });

                        $('#answerOptionsTxt').html(content);
                        setTimeout(function () {
                            $('.answerTextSplash').parents('.modal').modal("hide");
                        }, 10000);
                    } else {
                        Router.go("/onpolling");
                    }
                }
            }
        });
    });
    this.subscribe('Responses.session', Session.get("hashtag"));
    this.subscribe('AnswerOptions.options', Session.get("hashtag"));
    this.subscribe('MemberList.members', Session.get("hashtag"));
    this.subscribe('QuestionGroup.questionList', Session.get("hashtag"), function () {
        var doc = QuestionGroup.findOne();
        var i = 0;
        for (i; i < doc.questionList.length; i++) {
            oldStartTimeValues[i] = doc.questionList[i].startTime;
        }
        Session.set("oldStartTimeValues", oldStartTimeValues);
    });
    this.subscribe('Hashtags.public');
});

Template.live_results.onDestroyed(function () {
    Session.set("countdownInitialized", undefined);
    Session.set("sessionCountDown", undefined);
    if (countdown) {
        countdown.stop();
    }
    if (routeToLeaderboardTimer) {
        clearTimeout(routeToLeaderboardTimer);
    }
    if (readingConfirmationTracker) {
        readingConfirmationTracker.stop();
    }
});

Template.live_results.onRendered(()=>{
    startReadingConfirmationTracker();

    if (Session.get("isOwner") && EventManager.findOne() && EventManager.findOne().readingConfirmationIndex === -1) {
        Meteor.call("EventManager.showReadConfirmedForIndex", localData.getPrivateKey(), Session.get("hashtag"), 0);
    }
    Session.set("LearnerCountOverride", false);
    calculateButtonCount();
});

Template.live_results.helpers({
    votingText: function () {
        return Session.get("sessionClosed") ? "Game over" : "Countdown";
    },
    isOwner: function () {
        return Session.get("isOwner");
    },
    getCountdown: function () {
        if (Session.get("countdownInitialized")){
            var roundedCountdown = Math.round(countdown.get());
            return roundedCountdown < 0 ? 0 : roundedCountdown;
        }
        return 0;
    },
    isCountdownZero: function () {
        if (Session.get("sessionClosed") || !Session.get("countdownInitialized")){
            return true;
        } else {
            var timer = Math.round(countdown.get());
            return timer <= 0;
        }
    },
    getCountStudents: function () {
        return MemberList.find().count();
    },
    getPercentRead: (index)=>{
        return getPercentRead(index);
    },
    getCurrentRead: (index)=> {
        return getCurrentRead(index);
    },
    sessionClosed: function () {
        return Session.get("sessionClosed");
    },
    showLeaderBoardButton: function (index) {
        return !Session.get("countdownInitialized") && (AnswerOptions.find({questionIndex: index, isCorrect: 1}).count() > 0);
    },
    isMC: function(index){
        return AnswerOptions.find({questionIndex: index, isCorrect: 1}).count() > 1;
    },
    mcOptions: function(index){
        let memberAmount = Responses.find({questionIndex: index}).fetch();
        memberAmount = _.uniq(memberAmount, false, function(user) {return user.userNick;}).length;

        const correctAnswers = [];
        AnswerOptions.find({questionIndex: index, isCorrect:1},{fields:{"answerOptionNumber":1}}).forEach(function (answer){
            correctAnswers.push(answer.answerOptionNumber);
        });
        let allCorrect = 0;
        let allWrong = 0;
        MemberList.find().forEach(function(user){
            let responseAmount = 0;
            let everythingRight = true;
            let everythingWrong = true;
            Responses.find({questionIndex: index, userNick: user.nick}).forEach(function (response){
                if($.inArray(response.answerOptionNumber, correctAnswers) !== -1){
                    everythingWrong = false;
                }else{
                    everythingRight = false;
                }
                responseAmount++;
            });
            if(responseAmount){
                if(everythingRight && responseAmount === correctAnswers.length){
                    allCorrect++;
                }
                if(everythingWrong){
                    allWrong++;
                }
            }
        });
        return {
            allCorrect: {absolute: allCorrect, percent: memberAmount ? Math.floor((allCorrect * 100) / memberAmount) : 0},
            allWrong: {absolute: allWrong, percent: memberAmount ? Math.floor((allWrong * 100) / memberAmount) : 0}
        };
    },
    getNormalizedIndex: function (index) {
        return index +1;
    },
    allQuestionCount: function () {
        var doc = QuestionGroup.findOne();
        return doc ? doc.questionList.length : false;
    },
    questionList: function () {
        var questionDoc = QuestionGroup.findOne();
        if(!questionDoc) {
            return;
        }

        var questionList = questionDoc.questionList;
        if(EventManager.findOne().readingConfirmationIndex < questionList.length - 1) {
            questionList.splice(EventManager.findOne().readingConfirmationIndex + 1, questionList.length - (EventManager.findOne().readingConfirmationIndex + 1));
        }

        for(var i = 0; i < questionList.length; i++) {
            questionList[i].displayIndex = i;
        }

        return questionList ? questionList.reverse() : false;
    },
    answerList: function (index) {
        var result = [];
        var memberAmount = Responses.find({questionIndex: index}).fetch();
        memberAmount = _.uniq(memberAmount, false, function(user) {return user.userNick;}).length;

        var correctAnswerOptions = AnswerOptions.find({questionIndex: index, isCorrect: 1}).count();
        AnswerOptions.find({questionIndex: index}, {sort:{'answerOptionNumber':1}}).forEach(function(value){
            var amount = Responses.find({questionIndex: index, answerOptionNumber: value.answerOptionNumber}).count();
            result.push({
                name: String.fromCharCode(value.answerOptionNumber + 65),
                absolute: amount,
                percent: memberAmount ? (Math.floor((amount * 100) / memberAmount)) : 0,
                isCorrect: correctAnswerOptions ? value.isCorrect : -1
            });
        });
        return result;
    },
    isActiveQuestion: function (index) {
        return !Session.get("sessionClosed") && index === EventManager.findOne().questionIndex;
    },
    isRunningQuestion: ()=>{
        return Session.get("countdownInitialized");
    },
    showNextQuestionButton: ()=>{
        if (EventManager.findOne() && EventManager.findOne().readingConfirmationIndex <= EventManager.findOne().questionIndex) {
            return true;
        }
    },
    nextQuestionIndex: ()=>{
        return EventManager.findOne() ? EventManager.findOne().questionIndex + 2 : false;
    },
    nextReadingConfirmationIndex: ()=>{
        return EventManager.findOne() ? EventManager.findOne().readingConfirmationIndex + 2 : false;
    },
    getCSSClassForPercent: (percent)=>{
        return hsl_col_perc(percent, 0, 100);
    },
    showGlobalLeaderboardButton: ()=>{
        var questionDoc = QuestionGroup.findOne();
        if(!questionDoc) {
            return;
        }

        return Session.get("sessionClosed") || EventManager.findOne().questionIndex >= questionDoc.questionList.length - 1;
    },
    hasCorrectAnswerOptions: ()=>{
        return AnswerOptions.find({isCorrect: 1}).count() > 0;
    },
    showQuestionDialog: ()=>{
        if(!EventManager.findOne()) {
            return;
        }

        return EventManager.findOne().questionIndex === EventManager.findOne().readingConfirmationIndex;
    },
    hasReadConfirmationRequested: (index)=>{
        return index <= EventManager.findOne().questionIndex;
    },
    readingConfirmationListForQuestion: (index)=>{
        let result = [];
        let sortParamObj = Session.get('LearnerCountOverride') ? {lowerCaseNick: 1} : {insertDate: -1};
        let ownNick = MemberList.findOne({nick:Session.get("nick")}, {limit: 1});
        if ( !Session.get("isOwner") && ownNick.readConfirmed[index] ) {
            result.push(ownNick);
        }
        MemberList.find({nick: {$ne: Session.get("nick")}}, {
            sort: sortParamObj
        }).forEach(function (doc) {
            if(result.length < Session.get("LearnerCount") && doc.readConfirmed[index]) {
                result.push(doc);
            }
        });
        return result;
    },
    isOwnNick: (nick)=>{
        return nick === Session.get("nick");
    },
    showMoreButton: function (index) {
        var result = [];
        MemberList.find().forEach(function (doc) {
            if(doc.readConfirmed[index]) {
                result.push(doc);
            }
        });
        return ((result.length - Session.get("LearnerCount")) > 1);
    },
    invisibleLearnerCount: function (index) {
        var result = [];
        MemberList.find().forEach(function (doc) {
            if(doc.readConfirmed[index]) {
                result.push(doc);
            }
        });
        return result.length - Session.get("LearnerCount");
    }
});

Template.live_results.events({
    "click #js-btn-showQuestionModal": function (event) {
        event.stopPropagation();
        $('.questionContentSplash').parents('.modal').modal();
        var questionDoc = QuestionGroup.findOne();
        var content = "";
        if (questionDoc) {
            mathjaxMarkdown.initializeMarkdownAndLatex();
            var targetId = parseInt($(event.currentTarget).parents(".question-row").attr("id").replace("question-row_",""));
            var questionText = questionDoc.questionList[targetId].questionText;
            content = mathjaxMarkdown.getContent(questionText);
        }

        $('#questionText').html(content);
    },
    "click #js-btn-showAnswerModal": function (event) {
        event.stopPropagation();
        mathjaxMarkdown.initializeMarkdownAndLatex();
        $('.answerTextSplash').parents('.modal').modal();
        var content = "";
        var targetId = parseInt($(event.currentTarget).parents(".question-row").attr("id").replace("question-row_",""));

        AnswerOptions.find({questionIndex: targetId}, {sort:{answerOptionNumber: 1}}).forEach(function (answerOption) {
            if(!answerOption.answerText) {
                answerOption.answerText = "";
            }

            content += String.fromCharCode((answerOption.answerOptionNumber + 65)) + "<br/>";
            content += mathjaxMarkdown.getContent(answerOption.answerText) + "<br/>";
        });

        $('#answerOptionsTxt').html(content);
    },
    'click #js-btn-showQuestionAndAnswerModal': function (event) {
        event.stopPropagation();
        var questionDoc = QuestionGroup.findOne();
        if (!questionDoc) {
            return;
        }

        var targetId = parseInt($(event.currentTarget).parents(".question-row").attr("id").replace("question-row_",""));
        var content = "";
        mathjaxMarkdown.initializeMarkdownAndLatex();

        let hasEmptyAnswers = true;

        AnswerOptions.find({questionIndex: targetId}, {sort:{answerOptionNumber: 1}}).forEach(function (answerOption) {
            if(!answerOption.answerText) {
                answerOption.answerText = "";
            } else {
                hasEmptyAnswers = false;
            }

            content += String.fromCharCode((answerOption.answerOptionNumber + 65)) + "<br/>";
            content += mathjaxMarkdown.getContent(answerOption.answerText) + "<br/>";
        });

        if (hasEmptyAnswers) {
            content = "";
            $('#answerOptionsHeader').hide();
        }

        $('.questionAndAnswerTextSplash').parents('.modal').modal("show");
        $('.questionAndAnswerTextSplash>#questionText').html(mathjaxMarkdown.getContent(questionDoc.questionList[targetId].questionText));
        $('.questionAndAnswerTextSplash>#answerOptionsTxt').html(content);
    },
    "click .btn-showLeaderBoard": function (event) {
        event.stopPropagation();
        var targetId = parseInt($(event.currentTarget).attr("id").replace("js-btn-showLeaderBoard_",""));
        Session.set("showLeaderBoardId",targetId);
        Router.go("/statistics");
    },
    "click #js-btn-export": function (event) {
        event.stopPropagation();
        Meteor.call('Hashtags.export', {hashtag: Session.get("hashtag"), privateKey: localData.getPrivateKey()}, (err, res) => {
            if (err) {
                $('.errorMessageSplash').parents('.modal').modal('show');
                $("#errorMessage-text").html("Could not export!\n" + err.reason);
            } else {
                var exportData = "text/json;charset=utf-8," + encodeURIComponent(res);
                var a = document.createElement('a');
                var time = new Date();
                var timestring = time.getDate() + "_" + (time.getMonth() + 1) + "_" + time.getFullYear();
                a.href = 'data:' + exportData;
                a.download = Session.get("hashtag") + "-" + timestring + ".json";
                a.innerHTML = '';
                event.target.appendChild(a);
                if (Session.get("exportReady")) {
                    Session.set("exportReady", undefined);
                }
                else {
                    Session.set("exportReady", true);
                    a.click();
                }
            }
        });
    },
    'click #backButton': (event)=> {
        $('.sound-button').show();
        event.stopPropagation();
        Meteor.call('Responses.clearAll', localData.getPrivateKey(), Session.get("hashtag"));
        Meteor.call("MemberList.clearReadConfirmed", localData.getPrivateKey(), Session.get("hashtag"));
        Meteor.call("EventManager.setSessionStatus", localData.getPrivateKey(), Session.get("hashtag"), 2);
    },
    'click #startNextQuestion': (event)=> {
        event.stopPropagation();
        var questionDoc = QuestionGroup.findOne();
        if(!questionDoc) {
            return;
        }

        Meteor.call('Question.startTimer', {
            privateKey: localData.getPrivateKey(),
            hashtag: Session.get("hashtag"),
            questionIndex: EventManager.findOne().questionIndex + 1
        }, (err) => {
            if (err) {
                $('.errorMessageSplash').parents('.modal').modal('show');
                $("#errorMessage-text").html(err.reason);
                Session.set("sessionClosed", true);
            } else {
                Meteor.call("EventManager.setActiveQuestion",localData.getPrivateKey(), Session.get("hashtag"), EventManager.findOne().questionIndex + 1, ()=>{
                    startCountdown(EventManager.findOne().questionIndex);
                });
            }
        });
    },
    'click #goGlobalRanking': (event)=>{
        event.stopPropagation();
        Session.set("showLeaderBoardId",undefined);
        Router.go("/statistics");
    },
    'click #showNextQuestionDialog': (event)=>{
        event.stopPropagation();
        Meteor.call("EventManager.showReadConfirmedForIndex",localData.getPrivateKey(), Session.get("hashtag"), EventManager.findOne().questionIndex + 1);
    },
    "click .btn-more-learners": function () {
        Session.set("LearnerCount", MemberList.find().count());
        Session.set("LearnerCountOverride", true);
    },
    'click .btn-less-learners': function () {
        Session.set("LearnerCountOverride", false);
        calculateButtonCount();
    },
    'click .btn-learner': function (event) {
        event.preventDefault();
    }
});

Template.result_button.onRendered(function () {
    $(window).resize(function () {
        if (AnswerOptions.find({questionIndex: EventManager.findOne().questionIndex, isCorrect: 1}).count() > 1) {
            setMcCSSClasses();
        }
    });
    if (AnswerOptions.find({questionIndex: EventManager.findOne().questionIndex, isCorrect: 1}).count() > 1) {
        setMcCSSClasses();
    }
});

Template.result_button.helpers({
    getCSSClassForIsCorrect: checkIfIsCorrect
});

Template.result_button_mc.helpers({
    getCSSClassForIsCorrect: checkIfIsCorrect
});

Template.readingConfirmedLearner.onRendered(function () {
    calculateButtonCount();
});

Template.readingConfirmedLearner.helpers({
    isOwnNick: function (nickname) {
        return nickname === Session.get("nick");
    }
});

/**
 * @source http://stackoverflow.com/a/17267684
 */
function hsl_col_perc(percent,start,end) {
    var a = percent/100,
        b = end*a,
        c = b+start;
    return 'hsl('+c+',50%,25%)';
}

function getPercentRead (index) {
    var sumRead = 0;
    var count = 0;
    MemberList.find().map(function (member) {
        count++;
        if(member.readConfirmed[index]) {
            sumRead += member.readConfirmed[index];
        }
    });
    return count ? Math.floor(sumRead / count * 100) : 0;
}

function getCurrentRead (index) {
    var sumRead = 0;
    MemberList.find().map(function (member) {
        if (member.readConfirmed[index]) {
            sumRead += member.readConfirmed[index];
        }
    });
    return sumRead;
}

function checkIfIsCorrect(isCorrect){
    return isCorrect > 0 ? 'progress-success' : isCorrect < 0 ? 'progress-default' : 'progress-failure';
}

function startCountdown(index) {
    Meteor.call("EventManager.setActiveQuestion",localData.getPrivateKey(), Session.get("hashtag"), index);
    var questionDoc = QuestionGroup.findOne().questionList[index];
    Session.set("sessionCountDown", questionDoc.timer);
    $( "#countdowndiv" ).appendTo( $( "body" ) );
    $( "#countdown" ).appendTo( $( "body" ) );
    var f = new buzz.sound('/sounds/trillerpfeife.mp3',{
        volume: 50
    });
    countdown = new ReactiveCountdown(questionDoc.timer / 1000,{

        tick: function() {
            if(countdown.get() < 6){
                var image = document.getElementById('countdown');
                var image1 = $('.fader');
                var imageDiv = document.getElementById('countdowndiv');

                if (image.src.match("gr5")) {
                    image.src = "/images/gruen.gif";
                    image1.fadeIn(500);
                    imageDiv.style.display = "block";
                    image.style.display = "block";
                    image1.fadeOut(500);
                } else if (image.src.match("gruen")) {
                    imageDiv.style.backgroundColor = "#2f4f4f";
                    image.src = "/images/blau.gif";
                    image1.fadeIn(500);
                    image1.fadeOut(500);
                } else if (image.src.match("blau")) {
                    imageDiv.style.backgroundColor = "#663399";
                    image.src = "/images/lila3.gif";
                    image1.fadeIn(500);
                    image1.fadeOut(500);
                } else if (image.src.match("lila3")) {
                    imageDiv.style.backgroundColor = "#b22222";
                    image.src = "/images/rot2.gif";
                    image1.fadeIn(500);
                    image1.fadeOut(500);
                } else if (image.src.match("rot2")) {
                    imageDiv.style.backgroundColor = "#ff8c00";
                    image.src = "/images/orange1.gif";
                    image1.fadeIn(500);
                    image1.fadeOut(500);
                } else if (image.src.match("orange1")) {
                    imageDiv.style.backgroundColor="#ffd700";
                    image.src = "/images/gelb0.gif";
                    image1.fadeIn(500);
                    image1.fadeOut(500);
                    if (Session.get("togglemusic")){
                        f.play();
                    }
                }

            }
        }
    });

    buzzsound1.setVolume(Session.get("globalVolume"));
    if (Session.get("togglemusic")) {
        buzzsound1.play();
    }

    countdown.start(function () {
        buzzsound1.stop();
        Session.set("countdownInitialized", false);
        $('.disableOnActiveCountdown').removeAttr("disabled");
        if (index + 1 >= QuestionGroup.findOne().questionList.length) {
            Session.set("sessionClosed", true);
            if(Session.get("isOwner") && AnswerOptions.find({isCorrect: 1}).count() > 0) {
                routeToLeaderboardTimer = setTimeout( () => {
                    Router.go("/statistics");
                }, 7000);
            }
        }
    });
    Session.set("countdownInitialized", true);
    $('.disableOnActiveCountdown').attr("disabled","disabled");
}

function setMcCSSClasses () {
    var windowWidth = $(window).width();

    for (var i = 0; i < 2; i++){
        var label = $("#mc_label"+i);
        var bar = $("#mc_bar"+i);
        label.removeClass();
        bar.removeClass();
        if (windowWidth < 361) {
            label.addClass("col-xs-6 col-sm-6 col-md-6");
            bar.addClass("col-xs-6 col-sm-6 col-md-6");
        }
        if (windowWidth > 360 && windowWidth < 431) {
            label.addClass("col-xs-5 col-sm-5 col-md-5");
            bar.addClass("col-xs-7 col-sm-7 col-md-7");
        }
        if (windowWidth > 430 && windowWidth < 576) {
            label.addClass("col-xs-4 col-sm-4 col-md-4");
            bar.addClass("col-xs-8 col-sm-8 col-md-8");
        }
        if (windowWidth > 575 && windowWidth < 851) {
            label.addClass("col-xs-3 col-sm-3 col-md-3");
            bar.addClass("col-xs-9 col-sm-9 col-md-9");
        }
        if (windowWidth > 850 && windowWidth < 992) {
            label.addClass("col-xs-2 col-sm-2 col-md-2");
            bar.addClass("col-xs-10 col-sm-10 col-md-10");
        }
        if (windowWidth > 991 && windowWidth < 1151) {
            label.addClass("col-xs-4 col-sm-4 col-md-4");
            bar.addClass("col-xs-8 col-sm-8 col-md-8");
        }
        if (windowWidth > 1150 && windowWidth < 1701) {
            label.addClass("col-xs-3 col-sm-3 col-md-3");
            bar.addClass("col-xs-9 col-sm-9 col-md-9");
        }
        if (windowWidth > 1700) {
            label.addClass("col-xs-2 col-sm-2 col-md-2");
            bar.addClass("col-xs-10 col-sm-10 col-md-10");
        }
    }
}

function startReadingConfirmationTracker() {
    readingConfirmationTracker = Tracker.autorun(()=> {
        if (EventManager.findOne()) {
            EventManager.find().observeChanges({
                changed: function (id, changedFields) {
                    if (!isNaN(changedFields.readingConfirmationIndex)) {
                        $('.splash-screen-show-readingConfirmation').parents('.modal').modal();
                        var questionDoc = QuestionGroup.findOne();
                        var content = "";
                        if (questionDoc) {
                            mathjaxMarkdown.initializeMarkdownAndLatex();
                            var questionText = questionDoc.questionList[EventManager.findOne().readingConfirmationIndex].questionText;
                            content = mathjaxMarkdown.getContent(questionText);
                        }

                        $('#questionTText').html(content);
                    }

                    if(Session.get("isOwner")) {
                        $('#setReadConfirmed').text("Fenster schließen").parent().on('click', '#setReadConfirmed', function (event) {
                            event.stopPropagation();
                            closeSplashscreen();
                        });
                    }
                }
            });
        }
    });
}

/**
 * TODO remove this function with the Meteor 1.3 update and replace with an import from the memberList!
 */
function calculateButtonCount () {

    /*
     This session variable determines if the user has clicked on the show-more-button. The button count must not
     be calculated then. It is set in the event handler of the button and is reset if the user reenters the page
     */
    if (Session.get("LearnerCountOverride")) {
        return;
    }

    /*
     To calculate the maximum output of attendee button rows we need to:
     - get the contentPosition height (the content wrapper for all elements)
     - subtract the confirmationCounter height (the progress bar)
     - subtract the attendee-in-quiz-wrapper height (the session information for the attendees)
     - subtract the margin to the top (the title or the show more button)
     */
    var viewport = $(".contentPosition"),
        learnerListMargin = $('.learner-list').length > 0 ? parseInt($('.learner-list').first().css('margin-top').replace("px", "")) : 0;

    var viewPortHeight =
        viewport.outerHeight() -
        $('.question-title').outerHeight(true) -
        $('.readingConfirmationProgressRow').outerHeight(true) -
        $('.btn-more-learners').outerHeight(true) -
        learnerListMargin;

    /* The height of the learner button must be set manually if the html elements are not yet generated */
    var btnLearnerHeight = $('.btn-learner').first().parent().outerHeight() ? $('.btn-learner').first().parent().outerHeight() : 54;

    /* Calculate how much buttons we can place in the viewport until we need to scroll */
    var queryLimiter = Math.floor(viewPortHeight / btnLearnerHeight);

    /*
     Multiply the displayed elements by 3 if on widescreen and reduce the max output of buttons by 1 row for the display
     more button if necessary. Also make sure there is at least one row of buttons shown even if the user has to scroll
     */
    var allMembers = [];
    MemberList.find().forEach(function (doc) {
        if(doc.readConfirmed[EventManager.findOne().readingConfirmationIndex]) {
            allMembers.push(doc);
        }
    });
    var limitModifier = (viewport.outerWidth() >= 992) ? 3 : (viewport.outerWidth() >= 768 && viewport.outerWidth() < 992) ? 2 : 1;

    queryLimiter *= limitModifier;
    if (queryLimiter <= 0){
        queryLimiter = limitModifier;
    } else if(allMembers > queryLimiter) {

        /*
         Use Math.ceil() as a session owner because the member buttons position may conflict with the back/forward buttons position.
         As a session attendee we do not have these buttons, so we can use Math.floor() to display a extra row
         */
        if($(".fixed-bottom").length > 0) {
            queryLimiter -= Math.ceil($('.more-learners-row').first().outerHeight() / btnLearnerHeight) * limitModifier;
        } else {
            queryLimiter -= Math.floor($('.more-learners-row').first().outerHeight() / btnLearnerHeight) * limitModifier;
        }
    }

    /*
     This session variable holds the amount of shown buttons and is used in the helper function
     Template.memberlist.helpers.learners which gets the attendees from the mongo db
     */
    Session.set("LearnerCount", queryLimiter);
}
