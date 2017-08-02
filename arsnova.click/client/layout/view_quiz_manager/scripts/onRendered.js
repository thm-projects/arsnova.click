import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import {Tracker} from 'meteor/tracker';
import {TAPi18n} from 'meteor/tap:i18n';
import * as headerLib from '/client/layout/region_header/lib.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";
import * as localData from '/lib/local_storage.js';
import {getTooltipForRoute} from "/client/layout/global/scripts/lib.js";

Template.quizManager.onRendered(function () {
	const questionAddedTracker = new Tracker.Dependency();
	let popoverTimeout;
	this.autorun(function () {
		const connected = Meteor.status().connected;
		const valid = typeof Session.get("questionGroup") !== "undefined" ? Session.get("questionGroup").isValid() : false;
		const forwardButton = $('#forwardButton');
		if (popoverTimeout && (!connected || !valid)) {
			forwardButton.attr("disabled", "disabled");
			return;
		}
		forwardButton.popover("destroy");
		if (connected && valid) {
			forwardButton.removeAttr("disabled");
		} else {
			forwardButton.attr("disabled", "disabled");
			if (!connected) {
				forwardButton.popover({
					title: TAPi18n.__("view.quiz_manager.connection_lost"),
					trigger: 'manual',
					placement: 'top'
				});
				forwardButton.popover("show");
			} else if (!valid) {
				if (Session.get("questionGroup") && Session.get("questionGroup").getQuestionList().length > 0) {
					forwardButton.popover({
						title: TAPi18n.__("view.quiz_manager.session_invalid"),
						trigger: 'manual',
						placement: 'top'
					});
				} else {
					forwardButton.popover({
						title: TAPi18n.__("view.quiz_manager.session_empty"),
						trigger: 'manual',
						placement: 'top'
					});
				}
				forwardButton.popover("show");
			}
			popoverTimeout = Meteor.setTimeout(function () {
				forwardButton.popover("destroy");
				popoverTimeout = null;
			}, 4000);
		}
	}.bind(this));
	this.autorun(function () {
		if (Session.get("loading_language") || !Session.get("questionGroup")) {
			return;
		}
		$('#added_questions_wrapper').html("");
		Session.get("questionGroup").getQuestionList().forEach(function (item) {
			$('#added_questions_wrapper').append(
				$('<div id="' + item.getQuestionIndex() + '_added_question" class="questionElementWrapper tabbable draggable" role="listitem"/>').append(
					'<li data-valid="' + (item.isValid() ? "true" : "false") + '" aria-invalid="' + (item.isValid() ? "false" : "true") + '">' + (item.getQuestionIndex() + 1) + '. ' + TAPi18n.__(item.translationReferrer()) + (item.getQuestionText() ? ': ' + item.getQuestionText().replace(/([#$])*/g, "") : '') + '</li>'
				).append(
					$('<div class="contextMenu" />').append(
						"<div class='editQuestion text-light contextMenuItem'><span class='glyphicon glyphicon-edit' aria-hidden='true'></span></div>",
						"<div class='moveQuestionUp text-light contextMenuItem'><span class='glyphicon glyphicon-chevron-up' aria-hidden='true'></span></div>",
						"<div class='moveQuestionDown text-light contextMenuItem'><span class='glyphicon glyphicon-chevron-down' aria-hidden='true'></span></div>",
						"<div class='removeQuestion text-light contextMenuItem'><span class='glyphicon glyphicon-trash' aria-hidden='true'></span></div>"
					)
				)
			);
		});
		questionAddedTracker.changed();
	}.bind(this));
	this.autorun(function () {
		questionAddedTracker.depend();
		if (Session.get("loading_language")) {
			return;
		}
		$("#added_questions_wrapper").sortable({
			revert: "invalid",
			forceHelperSize: true,
			appendTo: "parent",
			scroll: false,
			helper: "clone",
			placeholder: "sortable-placeholder",
			forcePlaceholderSize: true,
			tolerance: "pointer",
			stop: function (event, ui) {
				const questionGroup = Session.get("questionGroup");
				if (typeof ui.item.attr("id") === "undefined") {
					const classNames = $(ui.item).attr('class').split(" ");
					const index = classNames.map(function (elem) {
						return elem.indexOf("questionType_") > -1;
					}).indexOf(true);
					const indexFrom = ui.item.index();
					questionGroup.addDefaultQuestion(indexFrom, classNames[index].replace("questionType_", ""));
					ui.item.attr("data-valid", questionGroup.getQuestionList()[indexFrom].isValid());
				} else {
					const indexTo = ui.item.index();
					const indexFrom = parseInt(ui.item.attr("id").replace("_added_question", ""));
					const question = questionGroup.getQuestionList()[indexFrom];
					questionGroup.removeQuestion(indexFrom);
					questionGroup.addQuestion(question, indexTo);
				}
				$('#added_questions_wrapper').find('.draggable').each(function (index, item) {
					$(item).attr("id", index + "_added_question");
				});
				Session.set("questionGroup", questionGroup);
				localData.addHashtag(Session.get("questionGroup"));
			}
		});
		$("#available_questions_wrapper").find(".draggable").draggable({
			connectToSortable: "#added_questions_wrapper",
			scroll: false,
			helper: "clone",
			revert: "invalid",
			stop: function () {
				Session.set("isMovingQuestion", false);
			}
		});
	}.bind(this));
	this.autorun(function () {
		footerElements.removeFooterElements();
		footerElements.addFooterElement(footerElements.footerElemHome);
		if ($(window).width() > 768) {
			footerElements.addFooterElement(footerElements.footerElemProductTour);
		}
		if (Meteor.status().connected) {
			footerElements.addFooterElement(footerElements.footerElemNicknames);
		}
		headerLib.calculateHeaderSize();
		headerLib.calculateTitelHeight();
	}.bind(this));
	Meteor.defer(function () {
		if (localStorage.getItem("showProductTour") !== "false") {
			getTooltipForRoute();
		}
	});
	$(".contentPosition").scrollTop(0);
});

Template.quizManagerDetails.onRendered(function () {
	this.autorun(function () {
		footerElements.removeFooterElements();
		footerElements.addFooterElement(footerElements.footerElemHome);
		if ($(window).width() > 768) {
			footerElements.addFooterElement(footerElements.footerElemProductTour);
		}
		headerLib.calculateHeaderSize();
		headerLib.calculateTitelHeight();
	}.bind(this));
	Meteor.defer(function () {
		if (localStorage.getItem("showProductTour") !== "false") {
			getTooltipForRoute();
		}
	});
	$(".contentPosition").scrollTop(0);
});
