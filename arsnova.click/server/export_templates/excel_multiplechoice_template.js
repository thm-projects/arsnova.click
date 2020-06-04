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
		},
		font: {
			color: "FFFFFFFF"
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
	for (let j = 0; j < answerList.length; j++) {
		const targetColumn = j + 2;
		ws.cell(4, targetColumn).style(Object.assign({}, answerCellStyle, {
			border: {
				right: {
					style: (targetColumn <= answerList.length) ? "thin" : "none",
					color: "black"
				}
			},
			fill: {
				type: "pattern",
				patternType: "solid",
				fgColor: answerList[j].isCorrect ? "FF008000" : "FFB22222"
			}
		}));
	}

	ws.cell(6, 1, responsesWithConfidenceValue.length > 0 ? 8 : 7, columnsToFormat).style(defaultStyles.statisticsRowStyle);
	ws.cell(6, 2, responsesWithConfidenceValue.length > 0 ? 8 : 7, columnsToFormat).style({
		alignment: {
			horizontal: "center"
		}
	});

	ws.cell(10, 1, 10, columnsToFormat).style(defaultStyles.attendeeHeaderRowStyle);
	ws.cell(10, 1).style({
		alignment: {
			horizontal: "left"
		}
	});

	ws.row(10).filter({
		firstRow: 10,
		firstColumn: 1,
		lastRow: 10,
		lastColumn: minColums
	});

	const hasEntries = allResponses.fetch().length > 0;
	const attendeeEntryRows = hasEntries ? (allResponses.fetch().length) : 1;
	const attendeeEntryRowStyle = hasEntries ? defaultStyles.attendeeEntryRowStyle : Object.assign({}, defaultStyles.attendeeEntryRowStyle, {
		alignment: {
			horizontal: "center"
		}
	});
	ws.cell(11, 1, attendeeEntryRows + 10, columnsToFormat, !hasEntries).style(attendeeEntryRowStyle);

	allResponses.forEach(function (responseItem, indexInList) {
		let nextColumnIndex = 3;
		const targetRow = indexInList + 11;
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
	ws.cell(6, 1).string(TAPi18n.__("export.number_of_answers", {lng: translation}) + ":");
	ws.cell(7, 1).string(TAPi18n.__("export.percent_correct", {lng: translation}) + ":");
	const correctResponsesPercentage = (allResponses.fetch().filter((x) => {
		return leaderboardLib.isCorrectResponse(x, questionGroup.questionList[index], index) === 1;
	}).length / allResponses.fetch().length * 100);
	ws.cell(7, 2).number((isNaN(correctResponsesPercentage) ? 0 : Math.round(correctResponsesPercentage)));
	if (responsesWithConfidenceValue.length > 0) {
		ws.cell(8, 1).string(TAPi18n.__("export.average_confidence", {lng: translation}) + ":");
		let confidenceSummary = 0;
		allResponses.forEach(function (item) {
			confidenceSummary += item.confidenceValue;
		});
		ws.cell(8, 2).number(Math.round((confidenceSummary / responsesWithConfidenceValue.length)));
	}
	ws.cell(4, 1).string(questionGroup.questionList[index].questionText.replace(/[#]*[*]*/g, ""));
	for (let j = 0; j < answerList.length; j++) {
		ws.cell(2, (j + 2)).string(TAPi18n.__("export.answer", {lng: translation}) + " " + (j + 1));
		ws.cell(4, (j + 2)).string(answerList[j].answerText);
		ws.cell(6, (j + 2)).number(calculateNumberOfAnswers(hashtag, index, j));
	}
	let nextColumnIndex = 1;
	ws.cell(10, nextColumnIndex++).string(TAPi18n.__("export.attendee", {lng: translation}));
	if (isCASRequired) {
		ws.cell(10, nextColumnIndex++).string(TAPi18n.__("export.cas_account_id", {lng: translation}));
		ws.cell(10, nextColumnIndex++).string(TAPi18n.__("export.cas_account_email", {lng: translation}));
	}
	ws.cell(10, nextColumnIndex++).string(TAPi18n.__("export.answer", {lng: translation}));
	if (responsesWithConfidenceValue.length > 0) {
		ws.cell(10, nextColumnIndex++).string(TAPi18n.__("export.confidence_level", {lng: translation}));
	}
	ws.cell(10, nextColumnIndex++).string(TAPi18n.__("export.time", {lng: translation}));

	const sortedResponses = _.sortBy(allResponses.fetch(), function (o) {
		return o.responseTime;
	});
	let nextStartRow = 10;
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
		const chosenAnswerString = [];
		chosenAnswer.forEach(function (chosenAnswerItem) {
			const isAnswerCorrect = AnswerOptionCollection.findOne({
				hashtag: hashtag,
				questionIndex: index,
				answerText: chosenAnswerItem
			}).isCorrect;
			chosenAnswerString.push({color: isAnswerCorrect ? "FF008000" : "FFB22222"});
			chosenAnswerString.push(chosenAnswerItem);
			chosenAnswerString.push({color: "FF000000"});
			chosenAnswerString.push(", ");
		});
		chosenAnswerString.pop();
		ws.cell(nextStartRow, nextColumnIndex++).string(chosenAnswerString);
		if (responsesWithConfidenceValue.length > 0) {
			ws.cell(nextStartRow, nextColumnIndex++).number(Math.round(responseItem.confidenceValue));
		}
		ws.cell(nextStartRow, nextColumnIndex++).number(responseItem.responseTime);
	});
	if (nextStartRow === 10) {
		ws.cell(11, 1).string(TAPi18n.__("export.attendee_complete_correct_none_available", {lng: translation}));
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
	const responsesWithConfidenceValue = allResponses.fetch().filter((x) => {
		return x.confidenceValue > -1;
	});
	const isCASRequired = SessionConfigurationCollection.findOne({hashtag: hashtag}).nicks.restrictToCASLogin;

	leaderboardLib.init(hashtag);
	formatSheet(ws, {responsesWithConfidenceValue, answerList, isCASRequired, allResponses, defaultStyles});
	setSheetData(ws, {
		responsesWithConfidenceValue,
		translation,
		isCASRequired,
		questionGroup,
		questionGroupObject,
		allResponses,
		answerList,
		hashtag,
		index
	});
}
