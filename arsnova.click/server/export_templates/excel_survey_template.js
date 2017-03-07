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
	ws.column(1).setWidth(30);
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

	ws.cell(10, 1, (allResponses.fetch().length + 9), columnsToFormat).style(defaultStyles.attendeeEntryRowStyle);

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
			}
		});
	});
}

function setSheetData(ws, {responsesWithConfidenceValue, translation, isCASRequired, questionGroup, questionGroupObject, allResponses, answerList, hashtag, index}) {
	ws.cell(1, 1).string(TAPi18n.__('export.question_type', {lng: translation}) + ': ' + TAPi18n.__(questionGroupObject.getQuestionList()[index].translationReferrer(), {lng: translation}));
	ws.cell(2, 1).string(TAPi18n.__("export.question", {lng: translation}));

	ws.cell(4, 1).string(questionGroup.questionList[index].questionText);
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
		ws.cell(7, 2).string((confidenceSummary / responsesWithConfidenceValue.length) + " %");
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

	allResponses.forEach(function (responseItem, indexInList) {
		let nextColumnIndex = 1;
		const targetRow = indexInList + 10;
		ws.cell(targetRow, nextColumnIndex++).string(responseItem.userNick);
		if (isCASRequired) {
			const profile = Meteor.users.findOne({_id: responseItem.userRef}).profile;
			ws.cell(targetRow, nextColumnIndex++).string(profile.id);
			ws.cell(targetRow, nextColumnIndex++).string(profile.mail instanceof Array ? profile.mail.slice(-1)[0] : profile.mail);
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
		ws.cell(targetRow, nextColumnIndex++).string(chosenAnswer.join(", "));
		if (responsesWithConfidenceValue.length > 0) {
			ws.cell(targetRow, nextColumnIndex++).string(responseItem.confidenceValue + " %");
		}
		ws.cell(targetRow, nextColumnIndex++).number(responseItem.responseTime);
	});
}

export function generateSheet(wb, {hashtag, translation, defaultStyles}, index) {
	const questionGroup = QuestionGroupCollection.findOne({hashtag: hashtag});
	const questionGroupObject = new DefaultQuestionGroup(JSON.parse(JSON.stringify(questionGroup)));
	const ws = wb.addWorksheet(TAPi18n.__('export.question', {lng: translation}) + ' ' + (index + 1), excelDefaultWorksheetOptions);
	const answerList = questionGroup.questionList[index].answerOptionList;
	const allResponses = ResponsesCollection.find({hashtag: hashtag, questionIndex: index});
	const responsesWithConfidenceValue = allResponses.fetch().filter((x)=> {return x.confidenceValue > -1;});
	const isCASRequired = SessionConfigurationCollection.findOne({hashtag: hashtag}).nicks.restrictToCASLogin;

	leaderboardLib.init(hashtag);
	formatSheet(ws, {responsesWithConfidenceValue, answerList, isCASRequired, allResponses, defaultStyles});
	setSheetData(ws, {responsesWithConfidenceValue, translation, isCASRequired, questionGroup, questionGroupObject, allResponses, answerList, hashtag, index});
}
