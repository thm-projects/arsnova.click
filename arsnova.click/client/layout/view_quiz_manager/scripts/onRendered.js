
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import {Tracker} from 'meteor/tracker';
import {TAPi18n} from 'meteor/tap:i18n';
import * as headerLib from '/client/layout/region_header/lib.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";
import * as localData from '/lib/local_storage.js';
import {getTooltipForRoute} from "/client/layout/global/scripts/lib.js";
import * as lib from './lib.js';

Template.quizManager.onRendered(function () {
	const questionAddedTracker = new Tracker.Dependency();
	let popoverTimeout;
	this.autorun(function () {
		const connected = Meteor.status().connected;
		const valid = Session.get("questionGroup") ? Session.get("questionGroup").isValid() : false;
		const forwardButton = $('#forwardButton');
		if (popoverTimeout) {
			Meteor.clearTimeout(popoverTimeout);
			popoverTimeout = null;
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
					placement: 'right'
				});
				forwardButton.popover("show");
			} else if (!valid) {
				forwardButton.popover({
					title: TAPi18n.__("view.quiz_manager.session_invalid"),
					trigger: 'manual',
					placement: 'right'
				});
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
				'<li id="' + item.getQuestionIndex() + '_added_question" data-valid="' + (item.isValid() ? "true" : "false") + '" class="draggable">' + TAPi18n.__(item.translationReferrer()) + '</li>'
			);
		});
		questionAddedTracker.changed();
	}.bind(this));
	this.autorun(function () {
		questionAddedTracker.depend();
		if (Session.get("loading_language")) {
			return;
		}
		$("#removeQuestionWrapper").sortable({
			revert: "invalid",
			scroll: false,
			placeholder: "remove-sortable-placeholder",
			appendTo: document.body,
			forceHelperSize: true,
			forcePlaceholderSize: true,
			tolerance: "pointer",
			accept: "#added_questions_wrapper .draggable",
			stop: function (event, ui) {
				Session.set("isMovingQuestion", false);
				const questionGroup = Session.get("questionGroup");
				const targetId = $(ui.item).attr("id").replace("_added_question", "");
				$(ui.item).remove();
				questionGroup.removeQuestion(targetId);
				Session.set("questionGroup", questionGroup);
				localData.addHashtag(Session.get("questionGroup"));
			}
		});
		$("#added_questions_wrapper").sortable({
			revert: "invalid",
			forceHelperSize: true,
			appendTo: document.body,
			scroll: false,
			helper: "clone",
			placeholder: "sortable-placeholder",
			forcePlaceholderSize: true,
			tolerance: "pointer",
			classes: {
				"ui-droppable-active": "highlight",
				"ui-droppable-hover": "highlight"
			},
			start: function () {
				Session.set("isMovingQuestion", true);
			},
			stop: function (event, ui) {
				Session.set("isMovingQuestion", false);
				const questionGroup = Session.get("questionGroup");
				if (typeof ui.item.attr("id") === "undefined") {
					const classNames = $(ui.item).attr('class').split(" ");
					const index      = classNames.map(function (elem) {
						return elem.indexOf("questionType_") > -1;
					}).indexOf(true);
					const indexTo   = questionGroup.getQuestionList().length;
					const indexFrom = ui.item.index();
					lib.recalculateIndices(questionGroup, indexFrom, indexTo, true);
					questionGroup.addDefaultQuestion(indexFrom, classNames[index].replace("questionType_", ""));
					ui.item.attr("data-valid", questionGroup.getQuestionList()[indexFrom].isValid());
				} else {
					/* We're moving a question around so we need to recalculate the question indices */
					const indexTo   = ui.item.index();
					const indexFrom = parseInt(ui.item.attr("id").replace("_added_question", ""));
					lib.recalculateIndices(questionGroup, indexFrom, indexTo);
				}
				$('#added_questions_wrapper').find('.draggable').each(function (index, item) {
					$(item).attr("id", index + "_added_question");
				}).draggable({
					connectToSortable: "#added_questions_wrapper, #removeQuestionWrapper",
					scroll: false,
					appendTo: document.body,
					revert: false
				}).disableSelection();
				Session.set("questionGroup", questionGroup);
				localData.addHashtag(Session.get("questionGroup"));
			}
		}).find('.draggable').draggable({
			connectToSortable: "#added_questions_wrapper, #removeQuestionWrapper",
			scroll: false,
			revert: "invalid",
			stop: function () {
				Session.set("isMovingQuestion", false);
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
		$("ul, li").disableSelection();
	}.bind(this));
	this.autorun(function () {
		footerElements.removeFooterElements();
		footerElements.addFooterElement(footerElements.footerElemHome);
		if (Meteor.status().connected) {
			footerElements.addFooterElement(footerElements.footerElemNicknames);
		}
		headerLib.calculateHeaderSize();
		headerLib.calculateTitelHeight();
	}.bind(this));
	getTooltipForRoute();
});

Template.quizManagerDetails.onRendered(function () {
	footerElements.removeFooterElements();
	footerElements.addFooterElement(footerElements.footerElemHome);
	headerLib.calculateHeaderSize();
	headerLib.calculateTitelHeight();
	getTooltipForRoute();
});
