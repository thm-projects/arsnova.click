
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import  * as localData from '/client/lib/local_storage.js';
import {HashtagsCollection} from '/lib/hashtags/collection.js';
import {AnswerOptionCollection} from '/lib/answeroptions/collection.js';
import {DefaultQuestionGroup} from "/lib/questions/questiongroup_default.js";
import {SingleChoiceQuestion} from "/lib/questions/question_choice_single.js";
import {MultipleChoiceQuestion} from "/lib/questions/question_choice_multiple.js";
import {RangedQuestion} from "/lib/questions/question_ranged.js";
import {SurveyQuestion} from "/lib/questions/question_survey.js";

Template.home.onCreated(function () {
	this.subscribe('HashtagsCollection.public', function () {
		var hashtag = "runde3";
		var reenter = false;
		if (hashtag.length > 0) {
			var localHashtags = localData.getAllHashtags();
			if ($.inArray(hashtag, localHashtags) > -1) {
				var oldHashtagDoc = HashtagsCollection.findOne({hashtag: hashtag});
				if (oldHashtagDoc) {
					reenter = true;
					localData.reenterSession(hashtag);
					Meteor.call('EventManagerCollection.add', localData.getPrivateKey(), hashtag, function () {
						Meteor.subscribe('AnswerOptionCollection.instructor', localData.getPrivateKey(), hashtag, function () {
							let test = new DefaultQuestionGroup({
								hashtag: hashtag,
								questionList: [
									new SingleChoiceQuestion({
										hashtag: hashtag,
										questionText: "singlechoicetext",
										timer: 10,
										startTime: 10,
										questionIndex: 0
									}),
									new MultipleChoiceQuestion({
										hashtag: hashtag,
										questionText: "multiplechoicetext",
										timer: 0,
										startTime: 0,
										questionIndex: 1
									}),
									new RangedQuestion({
										hashtag: hashtag,
										questionText: "rangedtext",
										timer: 0,
										startTime: 0,
										questionIndex: 2
									}),
									new SurveyQuestion({
										hashtag: hashtag,
										questionText: "surveytext",
										timer: 0,
										startTime: 0,
										questionIndex: 3
									})
								]
							});
							Session.set("test", test.serialize());
							console.log(test);
							console.log("------------------------------------");
							console.log(Session.get("test"));
							console.log("------------------------------------");
							let deserializeTest = new DefaultQuestionGroup(Session.get("test"));
							console.log(deserializeTest);
						});
					});
				}
			}
			if (!reenter) {
				var doc = {
					privateKey: localData.getPrivateKey(),
					hashtag: hashtag,
					sessionStatus: 1,
					lastConnection: (new Date()).getTime()
				};
				Meteor.call('HashtagsCollection.addHashtag', doc, (err) => {
					if (err) {
						console.log(err);
					} else {
						for (var i = 0; i < 4; i++) {
							Meteor.call("AnswerOptionCollection.addOption", {
								privateKey: localData.getPrivateKey(),
								hashtag: hashtag,
								questionIndex: 0,
								answerText: "",
								answerOptionNumber: i,
								isCorrect: 0
							});
						}
						Meteor.call("QuestionGroupCollection.insert", {
							privateKey: localData.getPrivateKey(),
							hashtag: hashtag,
							questionList: [
								{
									questionText: "",
									timer: 40000
								}
							]
						});

						localData.addHashtag(hashtag);
						Meteor.call('EventManagerCollection.add', localData.getPrivateKey(), hashtag, function () {
						});
					}
				});
			}
		}
	});
});
