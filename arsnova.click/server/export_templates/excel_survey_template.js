import {Meteor} from 'meteor/meteor';
import {TAPi18n} from 'meteor/tap:i18n';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {AnswerOptionCollection} from '/lib/answeroptions/collection.js';
import {ResponsesCollection} from '/lib/responses/collection.js';
import {SessionConfigurationCollection} from '/lib/session_configuration/collection.js';
import * as leaderboardLib from '/lib/leaderboard.js';
import {excelDefaultWorksheetOptions} from './excel_default_options.js';
import {calculateNumberOfAnswers} from './excel_function_library.js';
import {DefaultQuestionGroup} from '/lib/questions/questiongroup_default.js';

function formatSheet(ws, {responsesWithConfidenceValue, answerList, isCASRequired, allResponses, defaultStyles}) {
	let minColums = 3;
	if (responsesWithConfidenceValue.length > 0) {
		minColums++;
	}
	if (isCASRequired) {
		minColums += 2;
	}
	const columnsToFormat = answerList.length + 1 < minColums ? minColums : answerList.length + 1;
	const answerCellStyle = {
		alignment: {
			wrapText: true,
			horizontal: "center",
			vertical: "center"
		}
	};

	ws.row(1).setHeight(20);
	ws.column(1).setWidth(responsesWithConfidenceValue.length > 0 ? 40 : 30);
	for (let j = 2; j <= columnsToFormat; j++) {
		ws.column(j).setWidth(20);
	}

	ws.cell(1, 1, 1, columnsToFormat).style(defaultStyles.quizNameRowStyle);
	ws.cell(2, 1, 2, columnsToFormat).style(defaultStyles.exportedAtRowStyle);
	ws.cell(2, 2, 2, columnsToFormat).style({
		alignment: {
			horizontal: "center"
		}
	});

	ws.cell(4, 1).style(defaultStyles.questionCellStyle);
	ws.cell(4, 1, 4, columnsToFormat).style(Object.assign({}, answerCellStyle));

	ws.cell(6, 1, responsesWithConfidenceValue.length > 0 ? 7 : 6, columnsToFormat).style(defaultStyles.statisticsRowStyle);
	ws.cell(6, 2, responsesWithConfidenceValue.length > 0 ? 7 : 6, columnsToFormat).style({
		alignment: {
			horizontal: "center"
		}
	});
	ws.cell(9, 1, 9, columnsToFormat).style(defaultStyles.attendeeHeaderRowStyle);
	ws.cell(9, 1).style({
		alignment: {
			horizontal: "left"
		}
	});

	ws.row(9).filter({
		firstRow: 9,
		firstColumn: 1,
		lastRow: 9,
		lastColumn: minColums
	});

	const hasEntries = allResponses.fetch().length > 0;
	const attendeeEntryRows = hasEntries ? (allResponses.fetch().length) : 1;
	const attendeeEntryRowStyle = hasEntries ? defaultStyles.attendeeEntryRowStyle : Object.assign({}, defaultStyles.attendeeEntryRowStyle, {
		alignment: {
			horizontal: "center"
		}
	});
	ws.cell(10, 1, attendeeEntryRows + 9, columnsToFormat, !hasEntries).style(attendeeEntryRowStyle);

	allResponses.forEach(function (responseItem, indexInList) {
		let nextColumnIndex = 3;
		const targetRow = indexInList + 10;
		if (isCASRequired) {
			nextColumnIndex += 2;
		}
		if (responsesWithConfidenceValue.length > 0) {
			ws.cell(targetRow, nextColumnIndex++).style({
				alignment: {
					horizontal: "center"
				}
			});
		}
		ws.cell(targetRow, nextColumnIndex++).style({
			alignment: {
				horizontal: "center"
			},
			numberFormat: "#,##0;"
		});
	});
}

function setSheetData(ws, {responsesWithConfidenceValue, translation, isCASRequired, questionGroup, questionGroupObject, allResponses, answerList, hashtag, index}) {
	ws.cell(1, 1).string(TAPi18n.__('export.question_type', {lng: translation}) + ': ' + TAPi18n.__(questionGroupObject.getQuestionList()[index].translationReferrer(), {lng: translation}));
	ws.cell(2, 1).string(TAPi18n.__("export.question", {lng: translation}));

	ws.cell(4, 1).string(questionGroup.questionList[index].questionText.replace(/[#]*[*]*/g, ""));
	for (let j = 0; j < answerList.length; j++) {
		ws.cell(2, (j + 2)).string(TAPi18n.__("export.answer", {lng: translation}) + " " + (j + 1));
		ws.cell(4, (j + 2)).string(answerList[j].answerText);
		ws.cell(6, (j + 2)).number(calculateNumberOfAnswers(hashtag, index, j));
	}

	ws.cell(6, 1).string(TAPi18n.__("export.number_of_answers", {lng: translation}) + ":");

	if (responsesWithConfidenceValue.length > 0) {
		ws.cell(7, 1).string(TAPi18n.__("export.average_confidence", {lng: translation}) + ":");
		let confidenceSummary = 0;
		allResponses.forEach(function (item) {
			confidenceSummary += item.confidenceValue;
		});
		ws.cell(7, 2).number(Math.round(confidenceSummary / responsesWithConfidenceValue.length));
	}

	let nextColumnIndex = 1;
	ws.cell(9, nextColumnIndex++).string(TAPi18n.__("export.attendee", {lng: translation}));
	if (isCASRequired) {
		ws.cell(9, nextColumnIndex++).string(TAPi18n.__("export.cas_account_id", {lng: translation}));
		ws.cell(9, nextColumnIndex++).string(TAPi18n.__("export.cas_account_email", {lng: translation}));
	}
	ws.cell(9, nextColumnIndex++).string(TAPi18n.__("export.answer", {lng: translation}));
	if (responsesWithConfidenceValue.length > 0) {
		ws.cell(9, nextColumnIndex++).string(TAPi18n.__("export.confidence_level", {lng: translation}));
	}
	ws.cell(9, nextColumnIndex++).string(TAPi18n.__("export.time", {lng: translation}));

	const sortedResponses = _.sortBy(allResponses.fetch(), function (o) { return o.responseTime; });
	let nextStartRow = 9;
	sortedResponses.forEach(function (responseItem) {
		let nextColumnIndex = 1;
		nextStartRow++;
		ws.cell(nextStartRow, nextColumnIndex++).string(responseItem.userNick);
		if (isCASRequired) {
			const profile = Meteor.users.findOne({_id: responseItem.userRef}).profile;
			ws.cell(nextStartRow, nextColumnIndex++).string(profile.id);
			ws.cell(nextStartRow, nextColumnIndex++).string(profile.mail instanceof Array ? profile.mail.slice(-1)[0] : profile.mail);
		}
		const chosenAnswer = AnswerOptionCollection.find({
			hashtag: hashtag,
			questionIndex: index,
			answerOptionNumber: {
				$in: responseItem.answerOptionNumber
			}
		}).map((x) => {
			return x.answerText;
		});
		ws.cell(nextStartRow, nextColumnIndex++).string(chosenAnswer.join(", "));
		if (responsesWithConfidenceValue.length > 0) {
			ws.cell(nextStartRow, nextColumnIndex++).number(Math.round(responseItem.confidenceValue));
		}
		ws.cell(nextStartRow, nextColumnIndex++).number(responseItem.responseTime);
	});
	if (nextStartRow === 9) {
		ws.cell(10, 1).string(TAPi18n.__("export.attendee_complete_correct_none_available", {lng: translation}));
	}
}

export function generateSheet(wb, {hashtag, translation, defaultStyles}, index) {
	const questionGroup = QuestionGroupCollection.findOne({hashtag: hashtag});
	const questionGroupObject = new DefaultQuestionGroup(JSON.parse(JSON.stringify(questionGroup)));
	const date = new Date();
	const createdAt = (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) +
		"." + ((date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1)) +
		"." + date.getFullYear() +
		" " + TAPi18n.__('export.exported_at', {lng: translation}) +
		" " + (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) +
		":" + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) +
		" " + TAPi18n.__('export.exported_at_time', {lng: translation});
	const ws = wb.addWorksheet(TAPi18n.__('export.question', {lng: translation}) + ' ' + (index + 1), Object.assign({}, excelDefaultWorksheetOptions, {
		headerFooter: {
			firstHeader: TAPi18n.__('export.page_header', {lng: translation, createdAt: createdAt}),
			firstFooter: TAPi18n.__('export.page_footer', {lng: translation}),
			evenHeader: TAPi18n.__('export.page_header', {lng: translation, createdAt: createdAt}),
			evenFooter: TAPi18n.__('export.page_footer', {lng: translation}),
			oddHeader: TAPi18n.__('export.page_header', {lng: translation, createdAt: createdAt}),
			oddFooter: TAPi18n.__('export.page_footer', {lng: translation}),
			alignWithMargins: true,
			scaleWithDoc: false
		}
	}));
	const answerList = questionGroup.questionList[index].answerOptionList;
	const allResponses = ResponsesCollection.find({hashtag: hashtag, questionIndex: index});
	const responsesWithConfidenceValue = allResponses.fetch().filter((x)=> {return x.confidenceValue > -1;});
	const isCASRequired = SessionConfigurationCollection.findOne({hashtag: hashtag}).nicks.restrictToCASLogin;

	leaderboardLib.init(hashtag);
	formatSheet(ws, {responsesWithConfidenceValue, answerList, isCASRequired, allResponses, defaultStyles});
	setSheetData(ws, {responsesWithConfidenceValue, translation, isCASRequired, questionGroup, questionGroupObject, allResponses, answerList, hashtag, index});
}
