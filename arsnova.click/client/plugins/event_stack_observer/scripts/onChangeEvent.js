
import {Meteor} from 'meteor/meteor';
import {TAPi18n} from 'meteor/tap:i18n';
import {AnswerOptionCollection} from '/lib/answeroptions/collection.js';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import * as localData from '/lib/local_storage.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";
import {mathjaxMarkdown} from '/client/lib/mathjax_markdown.js';
import {Splashscreen, ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import {globalEventStackObserver} from '/client/plugins/event_stack_observer/scripts/lib.js';

function addDefaultChangeEvents() {
	globalEventStackObserver.onChange([
		"EventManagerCollection.beforeClear"
	], function () {
		if (!localData.containsHashtag(Router.current().params.quizName)) {
			new ErrorSplashscreen({
				autostart: true,
				errorMessage: TAPi18n.__("plugins.splashscreen.error.error_messages.session_closed")
			});
		}
		Router.go("/" + Router.current().params.quizName + "/resetToHome");
	});
}

function addMemberlistChangeEvents() {
	globalEventStackObserver.onChange([
		"EventManagerCollection.setSessionStatus"
	], function (key, value) {
		if (!isNaN(value.sessionStatus)) {
			if (value.sessionStatus === 3) {
				Router.go("/" + Router.current().params.quizName + "/results");
			}
		}
	});

	globalEventStackObserver.onChange([
		"MemberListCollection.removeLearner"
	], function (key, value) {
		if (value.user) {
			if (value.user === localStorage.getItem(Router.current().params.quizName + "nick")) {
				new ErrorSplashscreen({
					autostart: true,
					errorMessage: TAPi18n.__("plugins.splashscreen.error.error_messages.kicked_from_quiz")
				});
				Router.go("/" + Router.current().params.quizName + "/resetToHome");
			}
		}
	});
}

function addLiveresultsChangeEvents() {
	globalEventStackObserver.onChange([
		"EventManagerCollection.setSessionStatus"
	], function (key, value) {
		if (!isNaN(value.sessionStatus)) {
			if (value.sessionStatus === 2) {
				$('.modal-backdrop').remove();
				Router.go("/" + Router.current().params.quizName + "/memberlist");
			}
		}
	});

	globalEventStackObserver.onChange([
		"EventManagerCollection.setActiveQuestion"
	], function (key, value) {
		if (!isNaN(value.questionIndex) && value.questionIndex !== -1) {
			if (localData.containsHashtag(Router.current().params.quizName)) {
				new Splashscreen({
					autostart: true,
					instanceId: "answers_" + value.questionIndex,
					templateName: 'questionAndAnswerSplashscreen',
					closeOnButton: '#js-btn-hideQuestionModal',
					onRendered: function (instance) {
						var content = "";
						mathjaxMarkdown.initializeMarkdownAndLatex();
						AnswerOptionCollection.find({questionIndex: value.questionIndex}, {sort: {answerOptionNumber: 1}}).forEach(function (answerOption) {
							if (!answerOption.answerText) {
								answerOption.answerText = "";
							}

							content += String.fromCharCode((answerOption.answerOptionNumber + 65)) + "<br/>";
							content += mathjaxMarkdown.getContent(answerOption.answerText) + "<br/>";
						});

						instance.templateSelector.find('#answerContent').html(content);
						setTimeout(function () {
							instance.close();
						}, 10000);
					}
				});
				if (value.questionIndex + 1 >= QuestionGroupCollection.findOne().questionList.length) {
					footerElements.removeFooterElement(footerElements.footerElemReadingConfirmation);
				} else {
					footerElements.addFooterElement(footerElements.footerElemReadingConfirmation, 2);
				}
				footerElements.calculateFooter();
			} else {
				Router.go("/" + Router.current().params.quizName + "/onpolling");
			}
		}
	});

	globalEventStackObserver.onChange([
		"EventManagerCollection.showReadConfirmedForIndex"
	], function (key, value) {
		if (!isNaN(value.readingConfirmationIndex) && value.readingConfirmationIndex > -1) {
			var questionDoc = QuestionGroupCollection.findOne();
			new Splashscreen({
				autostart: true,
				templateName: 'readingConfirmedSplashscreen',
				closeOnButton: '#setReadConfirmed',
				onRendered: function (instance) {
					var content = "";
					if (questionDoc) {
						mathjaxMarkdown.initializeMarkdownAndLatex();
						var questionText = questionDoc.questionList[EventManagerCollection.findOne().readingConfirmationIndex].questionText;
						content = mathjaxMarkdown.getContent(questionText);
					}
					instance.templateSelector.find('#questionContent').html(content);

					if (localData.containsHashtag(Router.current().params.quizName)) {
						instance.templateSelector.find('#setReadConfirmed').text(TAPi18n.__("global.close_window"));
					} else {
						instance.templateSelector.find('#setReadConfirmed').parent().on('click', '#setReadConfirmed', function () {
							Meteor.call("MemberListCollection.setReadConfirmed", {
								hashtag: Router.current().params.quizName,
								questionIndex: EventManagerCollection.findOne().readingConfirmationIndex,
								nick: localStorage.getItem(Router.current().params.quizName + "nick")
							}, (err)=> {
								if (err) {
									new ErrorSplashscreen({
										autostart: true,
										errorMessage: TAPi18n.__("plugins.splashscreen.error.error_messages." + err.reason)
									});
								}
							});
						});
					}
				}
			});
		}
	});
}

export function getChangeEventsForRoute(route) {
	if (typeof route === "undefined" || !route.startsWith(":quizName.") || !globalEventStackObserver || !globalEventStackObserver.isRunning()) {
		return;
	}
	route = route.replace(":quizName.", "");

	switch (route) {
		case "memberlist":
			addMemberlistChangeEvents();
			break;
		case "results":
		case "statistics":
			addLiveresultsChangeEvents();
			break;
	}
	addDefaultChangeEvents();
}
