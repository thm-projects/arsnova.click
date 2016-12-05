
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import {TAPi18n} from 'meteor/tap:i18n';
import * as headerLib from '/client/layout/region_header/lib.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";
import * as localData from '/lib/local_storage.js';
import * as lib from './lib.js';

Template.quizManager.onRendered(function () {
	Session.get("questionGroup").getQuestionList().forEach(function (item) {
		$('#added_questions_wrapper').append(
			'<li id="' + item.getQuestionIndex() + '_added_question" data-valid="' + (item.isValid() ? "true" : "false") + '" class="draggable">' + TAPi18n.__(item.translationReferrer()) + '</li>'
		);
	});
	$('#added_questions_wrapper').find('.draggable').draggable({
		connectToSortable: "#added_questions_wrapper, #removeQuestionWrapper",
		scroll: false,
		revert: "invalid",
		stop: function () {
			Session.set("isMovingQuestion", false);
		}
	});
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
				console.log(questionGroup);
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

	footerElements.removeFooterElements();
	footerElements.addFooterElement(footerElements.footerElemHome);
	footerElements.addFooterElement(footerElements.footerElemNicknames);
	headerLib.calculateHeaderSize();
	headerLib.calculateTitelHeight();

	const guide = $("body").guide();
	guide.addStep(".quizSummary", "Hier ist die Zusammenfassung der gesamten Quizrunde zu sehen");
	guide.addStep(".quizSummary #sessionUrl", "Unter dieser URL können Teilnehmer das Quiz betreten, sobald du es freigibst");
	guide.addStep(".quizSummary #questionGroupValidation", "Die Validierung der Quizrunde schlägt fehl, sofern das Quiz noch nicht fertiggstellt ist. Dazu zählen nicht vorhandene Quizfragen, fehlende oder unvollständige Antwortoptionen, nicht gesetzte Timer, usw.");
	guide.addStep(".quizSummary #restrictToCas", "Ist diese Einstellung aktiv, müssen sich die Teilnehmer am zentralen Authentifizierungsdienst der Technischen Hochschule Mittelhessen anmelden, um am Quiz teilnehmen zu können");
	guide.addStep("#available_questions_wrapper", "Hier siehst du alle Fragetypen, aus denen du wählen kannst. Jeder Fragetyp bietet unterschiedliche Vorsteinllungen und Möglichkeitung zur Gestaltung des Quizzes");
	guide.addStep("#available_questions_wrapper .questionType_SingleChoiceQuestion", "SingleChoice Fragen enhalten beliebig viele Antwortoptionen, von denen genau eine als richtig markiert werden muss");
	guide.addStep("#available_questions_wrapper .questionType_YesNoSingleChoiceQuestion", "Ja|Nein Fragen enthalten nur zwei Antwortopionen (Ja und Nein), von denen eine als richtig markiert werden muss");
	guide.addStep("#available_questions_wrapper .questionType_TrueFalseSingleChoiceQuestion", "Wahr|Falsch Fragen enthalten ebenfalls nur zwei Antwortopionen (Wahr und Falsch), von denen eine als richtig markiert werden muss");
	guide.addStep("#available_questions_wrapper .questionType_MultipleChoiceQuestion", "Multiple-Choice Fragen enthalten beliebig viele Antwortoptionen, von denen beliebig viele (mindestens jedoch zwei) als richtig markiert werden können");
	guide.addStep("#available_questions_wrapper .questionType_RangedQuestion", "Für die Schätzfrage muss eine Ganzzahl als richtig angegeben werden. Zusätzlich können Toleranzen nach oben und unten eingegeben werden");
	guide.addStep("#available_questions_wrapper .questionType_FreeTextQuestion", "In der Freitextfrage muss der Teilnehmer einen beliebigen Text eingeben. Dieser wird mit dem vorab eingegebenen Referenzwert verglichen");
	guide.addStep("#available_questions_wrapper .questionType_SurveyQuestion", "Umfragen enthalten beliebig viele Antwortoptionen, von denen keine als richtig oder falsch markiert werden darf.");
	guide.addStep("#added_questions_wrapper", "Hier findest du alle deine Quizfragen, die im Quiz vorhanden sind. Um eine Quizfrage dem Quiz hinzuzufügen, ziehe sie einfach aus dem linken Stapel hierher. Mit einem Klick auf die Frage kannst du die Inhalte der Quizfrage einstellen.");
	guide.start();
});

Template.quizManagerDetails.onRendered(function () {
	footerElements.removeFooterElements();
	footerElements.addFooterElement(footerElements.footerElemHome);
	headerLib.calculateHeaderSize();
	headerLib.calculateTitelHeight();
});
