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

Template.live_results.onCreated(function () {
    this.autorun(() => {
        this.subscription = Meteor.subscribe('Responses.session', Session.get("hashtag"));
        this.subscription = Meteor.subscribe('AnswerOptions.options', Session.get("hashtag"), function () {
            Session.set("rightAnswerOptionCount", AnswerOptions.find({isCorrect: 1}).count());
        });
        this.subscription = Meteor.subscribe('MemberList.members', Session.get("hashtag"));
        this.subscription = Meteor.subscribe('Sessions.question', Session.get("hashtag"), function () {
            if (!Session.get("sessionClosed")){
                var sessionDoc = Sessions.findOne();
                Session.set("sessionCountDown", sessionDoc.timer);
                var timestamp = new Date().getTime();
                $( "#countdowndiv" ).appendTo( $( "body" ) );
                $( "#countdown" ).appendTo( $( "body" ) );
                var f = new buzz.sound('/sounds/trillerpfeife.mp3',{
                    volume:50
                });
                countdown = new ReactiveCountdown((timestamp - sessionDoc.startTime + sessionDoc.timer) / 1000,{

                    tick: function() {
                        if(countdown.get()<=6){
                            var image = document.getElementById('countdown');
                            var image1 = $('.fader');
                            var imageDiv = document.getElementById('countdowndiv');

                            if (image.src.match("gr5")) {

                                image.src = "/images/gruen.gif";
                                image1.fadeIn(500);
                                imageDiv.style.display="block";
                                image.style.display="block";
                                image1.fadeOut(500);
                            }else if (image.src.match("gruen")) {
                                imageDiv.style.backgroundColor="#2f4f4f";

                                image.src = "/images/blau.gif";
                                image1.fadeIn(500);
                                image1.fadeOut(500);
                            } else if(image.src.match("blau")){
                                imageDiv.style.backgroundColor="#663399";

                                image.src = "/images/lila3.gif";
                                image1.fadeIn(500);
                                image1.fadeOut(500);
                            } else if(image.src.match("lila3")){
                                imageDiv.style.backgroundColor="#b22222";


                                image.src="/images/rot2.gif";
                                image1.fadeIn(500);
                                image1.fadeOut(500);
                            }else if(image.src.match("rot2")){
                                imageDiv.style.backgroundColor="#ff8c00";



                                image.src="/images/orange1.gif";
                                image1.fadeIn(500);
                                image1.fadeOut(500);
                            } else if(image.src.match("orange1")){
                                imageDiv.style.backgroundColor="#ffd700";

                                image.src="/images/gelb0.gif";
                                image1.fadeIn(500);
                                image1.fadeOut(500);
                                f.play();
                            }

                        }
                    }
                });

                buzzsound1.setVolume(globalVolume);
                buzzsound1.play();
                countdown.start(function () {
                    buzzsound1.stop();
                    Session.set("sessionClosed", true);
                    if (Session.get("isOwner")) {
                        setTimeout(function () {Router.go("/statistics");}, 7000);
                    }
                });
                Session.set("countdownInitialized", true);
            } else {
                Session.set("countdownInitialized", false);
            }
        });
        this.subscription = Meteor.subscribe('Hashtags.public', Session.get("hashtag"));
    });
});


Template.result_button.onRendered(function () {
    $(window).resize(function () {
        var answerOptions = AnswerOptions.find({hashtag: Session.get("hashtag"), isCorrect: 1}).count();
        if (answerOptions > 1) {
            setMcCSSClasses();
        }
    });
});

Template.result_button.rendered = function () {
    var answerOptions = AnswerOptions.find({hashtag: Session.get("hashtag"), isCorrect: 1}).count();
    if (answerOptions > 1) {
        setMcCSSClasses();
    }
};

function setMcCSSClasses () {
    var windowWidth = $(window).width();

    var i = 0;
    for (i; i<2;i++){
        $("#mc_label"+i).removeClass();
        $("#mc_bar"+i).removeClass();
        if (windowWidth < 361) {
            $("#mc_label"+i).addClass("col-xs-6 col-sm-6 col-md-6");
            $("#mc_bar"+i).addClass("col-xs-6 col-sm-6 col-md-6");
        }
        if (windowWidth > 360 && windowWidth < 431) {
            $("#mc_label"+i).addClass("col-xs-5 col-sm-5 col-md-5");
            $("#mc_bar"+i).addClass("col-xs-7 col-sm-7 col-md-7");
        }
        if (windowWidth > 430 && windowWidth < 576) {
            $("#mc_label"+i).addClass("col-xs-4 col-sm-4 col-md-4");
            $("#mc_bar"+i).addClass("col-xs-8 col-sm-8 col-md-8");
        }
        if (windowWidth > 575 && windowWidth < 851) {
            $("#mc_label"+i).addClass("col-xs-3 col-sm-3 col-md-3");
            $("#mc_bar"+i).addClass("col-xs-9 col-sm-9 col-md-9");
        }
        if (windowWidth > 850 && windowWidth < 992) {
            $("#mc_label"+i).addClass("col-xs-2 col-sm-2 col-md-2");
            $("#mc_bar"+i).addClass("col-xs-10 col-sm-10 col-md-10");
        }
        if (windowWidth > 991 && windowWidth < 1151) {
            $("#mc_label"+i).addClass("col-xs-4 col-sm-4 col-md-4");
            $("#mc_bar"+i).addClass("col-xs-8 col-sm-8 col-md-8");
        }
        if (windowWidth > 1150 && windowWidth < 1701) {
            $("#mc_label"+i).addClass("col-xs-3 col-sm-3 col-md-3");
            $("#mc_bar"+i).addClass("col-xs-9 col-sm-9 col-md-9");
        }
        if (windowWidth > 1700) {
            $("#mc_label"+i).addClass("col-xs-2 col-sm-2 col-md-2");
            $("#mc_bar"+i).addClass("col-xs-10 col-sm-10 col-md-10");
        }
    }
}

Template.live_results.helpers({
    votingText: function () {
      if (Session.get("sessionClosed")){
          return "Game over";
      } else {
          return "Countdown";
      }
    },
    isOwner: function () {
        return Session.get("isOwner");
    },
    getCountdown: function () {
        if (Session.get("countdownInitialized")){
            var timer = Math.round(countdown.get())
            if (timer < 0){
                return 0;
            } else {
                return Math.round(countdown.get());
            }
        } else {
            return 0;
        }
    },
    isCountdownZero: function () {
        if (Session.get("sessionClosed")){
            return true;
        } else {
            var timer = Math.round(countdown.get())
            if (timer <= 0){
                return true;
            } else {
                return false;
            }
        }
    },
    getCountStudents: function () {
        return MemberList.find().count();
    },
    sessionClosed: function () {
        return Session.get("sessionClosed");
    },
    showLeaderBoardButton: function () {
        return (AnswerOptions.find({isCorrect: 1}).count() > 0);
    },
    result: function () {
        var result = [];

        var memberAmount = Responses.find({hashtag: Session.get("hashtag")}).fetch();
        memberAmount = _.uniq(memberAmount, false, function(user) {return user.userNick}).length;

        var correctAnswerOptions = AnswerOptions.find({hashtag: Session.get("hashtag"), isCorrect: 1}).count();

        if(!correctAnswerOptions){ //survey
            AnswerOptions.find({hashtag: Session.get("hashtag")}, {sort:{'answerOptionNumber':1}}).forEach(function(value){
                var amount = Responses.find({hashtag: Session.get("hashtag"), answerOptionNumber: value.answerOptionNumber}).count();
                result.push({name: String.fromCharCode(value.answerOptionNumber + 65), absolute: amount, percent: memberAmount ? ( Math.floor((amount * 100) / memberAmount)) : 0, isCorrect: -1});
            });
        } else { //MC / SC
            if(correctAnswerOptions === 1){ //SC
                AnswerOptions.find({hashtag: Session.get("hashtag")}, {sort:{'answerOptionNumber':1}}).forEach(function(value){
                    var amount = Responses.find({hashtag: Session.get("hashtag"), answerOptionNumber: value.answerOptionNumber}).count();
                    result.push({name: String.fromCharCode(value.answerOptionNumber + 65), absolute: amount, percent: memberAmount ? (Math.floor((amount * 100) / memberAmount)) : 0, isCorrect: value.isCorrect});
                });

            } else { //MC
                AnswerOptions.find({hashtag: Session.get("hashtag")}, {sort:{'answerOptionNumber':1}}).forEach(function(value){

                    var amount = Responses.find({hashtag: Session.get("hashtag"), answerOptionNumber: value.answerOptionNumber}).count();
                    result.push({name: String.fromCharCode(value.answerOptionNumber + 65), absolute: amount, percent: memberAmount ? ( Math.floor((amount * 100) / memberAmount)) : 0, isCorrect: value.isCorrect});
                });
            }
        }
        return result;
    },
    isMC: function(){
        var answerOptions = AnswerOptions.find({hashtag: Session.get("hashtag"), isCorrect: 1}).count();
        return answerOptions > 1;
    },
    mcOptions: function(){

        let memberAmount = Responses.find({hashtag: Session.get("hashtag")}).fetch();
        memberAmount = _.uniq(memberAmount, false, function(user) {return user.userNick}).length;

        const correctAnswers = [];
        AnswerOptions.find({hashtag: Session.get("hashtag"), isCorrect:1},{fields:{"answerOptionNumber":1}}).forEach(function (answer){
            correctAnswers.push(answer.answerOptionNumber);
        });
        let allCorrect = 0;
        let allWrong = 0;
        MemberList.find({hashtag: Session.get("hashtag")}).forEach(function(user){
            let responseAmount = 0;
            let everythingRight = true;
            let everythingWrong = true;
            Responses.find({hashtag: Session.get("hashtag"), userNick: user.nick}).forEach(function (response){
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
    }
});



Template.live_results.events({
    "click #js-btn-showQuestionModal": function () {
        $('.questionContentSplash').parents('.modal').modal();
        var sessionDoc = Sessions.findOne();
        var content = "";
        if (sessionDoc) {
            mathjaxMarkdown.initializeMarkdownAndLatex();
            var questionText = sessionDoc.questionText;
            content = mathjaxMarkdown.getContent(questionText);
        }

        $('#questionText').html(content);
    },
    "click #js-btn-showAnswerModal": function () {
        $('.answerTextSplash').parents('.modal').modal();
    },
    "click #js-btn-showLeaderBoard": function () {
        Router.go("/statistics");
    },
    "click #js-btn-export": function (event) {
        Meteor.call('Hashtags.export', {hashtag: Session.get("hashtag"), privateKey: localData.getPrivateKey()}, (err, res) => {
            if (err) {
                alert("Could not export!\n" + err);
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
    }

});


Template.result_button.helpers({
    getCSSClassForIsCorrect: function (isCorrect) {
        if (isCorrect > 0) {
            return 'progress-success';
        } else if (isCorrect < 0) {
            return 'progress-default';
        } else {
            return 'progress-failure';
        }
    }
});

Template.result_button_mc.helpers({
    getCSSClassForIsCorrect: function (isCorrect) {
        if (isCorrect > 0) {
            return 'progress-success';
        } else if (isCorrect < 0) {
            return 'progress-default';
        } else {
            return 'progress-failure';
        }
    }
});
