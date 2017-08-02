import {Meteor} from 'meteor/meteor';
import {TAPi18n} from 'meteor/tap:i18n';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {ResponsesCollection} from '/lib/responses/collection.js';
import {SessionConfigurationCollection} from '/lib/session_configuration/collection.js';
import * as leaderboardLib from '/lib/leaderboard.js';
import {excelDefaultWorksheetOptions} from './excel_default_options.js';
import {DefaultQuestionGroup} from '/lib/questions/questiongroup_default.js';
import {distinctValuesFromCollection} from '/lib/global.js';

function formatSheet(ws, {responsesWithConfidenceValue, isCASRequired, columnsToFormat, questionGroup, leaderboardData, defaultStyles}) {
	ws.row(1).setHeight(20);
	ws.column(1).setWidth(30);
	ws.column(2).setWidth(isCASRequired ? 10 : 20);
	for (let i = 3; i <= columnsToFormat; i++) {
		ws.column(i).setWidth(22);
	}

	ws.cell(1, 1, 1, columnsToFormat).style(Object.assign({}, defaultStyles.quizNameRowStyle, {
		alignment: {
			vertical: "center"
		}
	}));
	ws.cell(1, columnsToFormat - 1).style({
		alignment: {
			horizontal: "left",
			vertical: "center"
		}
	});

	ws.cell(2, 1, 2, columnsToFormat).style(defaultStyles.exportedAtRowStyle);

	ws.cell(1, 1, 2, 1).style({
		alignment: {
			indent: 5
		}
	});

	ws.cell(4, 1, 8, columnsToFormat).style(defaultStyles.statisticsRowStyle);
	ws.cell(4, 3, 8, 3).style({
		alignment: {
			horizontal: "left"
		}
	});
	ws.cell(8, 3).style({
		numberFormat: '#,##0'
	});

	ws.cell(10, 1, 11, columnsToFormat).style(defaultStyles.attendeeHeaderGroupRowStyle);
	ws.cell(12, 1, 12, columnsToFormat).style(defaultStyles.attendeeHeaderRowStyle);
	ws.cell(12, 1).style({
		alignment: {
			horizontal: "left"
		}
	});

	ws.row(12).filter({
		firstRow: 12,
		firstColumn: 1,
		lastRow: 12,
		lastColumn: columnsToFormat
	});

	let nextStartRow = 18;
	let dataWithoutCompleteCorrectQuestions = 0;
	leaderboardData.forEach(function (leaderboardItem, indexInList) {
		let hasNotAllQuestionsCorrect = false;
		questionGroup.questionList.forEach(function (item, index) {
			if (item.type !== "SurveyQuestion" && leaderboardItem.correctQuestions.indexOf((index + 1)) === -1) {
				hasNotAllQuestionsCorrect = true;
			}
		});
		if (hasNotAllQuestionsCorrect) {
			dataWithoutCompleteCorrectQuestions++;
			return;
		}
		let nextColumnIndex = 3;
		nextStartRow++;
		const targetRow = indexInList + 13;
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
		ws.cell(targetRow, nextColumnIndex++).style({
			alignment: {
				horizontal: "center"
			},
			numberFormat: "#,##0;"
		});
	});
	if (nextStartRow === 18) {
		ws.cell(13, 1, 13, columnsToFormat, true).style(Object.assign({}, defaultStyles.attendeeEntryRowStyle, {
			alignment: {
				horizontal: "center"
			}
		}));
		nextStartRow++;
	} else {
		ws.cell(13, 1, (leaderboardData.length + 12 - dataWithoutCompleteCorrectQuestions), columnsToFormat).style(defaultStyles.attendeeEntryRowStyle);
	}

	ws.cell(nextStartRow++, 1, nextStartRow++, columnsToFormat).style(defaultStyles.attendeeHeaderGroupRowStyle);

	ws.cell(nextStartRow, 1, nextStartRow, columnsToFormat).style(defaultStyles.attendeeHeaderRowStyle);
	ws.cell(nextStartRow, 1).style({
		alignment: {
			horizontal: "left"
		}
	});
	nextStartRow++;

	ws.cell(nextStartRow, 1, (leaderboardData.length + (nextStartRow - 1)), columnsToFormat).style(defaultStyles.attendeeEntryRowStyle);

	leaderboardData.forEach(function (leaderboardItem, indexInList) {
		let nextColumnIndex = 3;
		const targetRow = indexInList + nextStartRow;
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
		ws.cell(targetRow, nextColumnIndex++).style({
			alignment: {
				horizontal: "center"
			},
			numberFormat: "#,##0;"
		});
	});
}

function setSheetData(ws, {responsesWithConfidenceValue, translation, isCASRequired, questionGroup, questionGroupObject, hashtag, columnsToFormat, leaderboardData, numberOfAttendees}) {
	const date = new Date();
	let currentRowIndex = 1;
	ws.cell(currentRowIndex, 1).string(TAPi18n.__('export.quiz_name', {lng: translation}) + ': ' + TAPi18n.__(questionGroupObject.getHashtag(), {lng: translation}));
	ws.cell(currentRowIndex, columnsToFormat - 1).string(TAPi18n.__('export.session_content', {lng: translation}));
	currentRowIndex++;

	ws.cell(currentRowIndex, 1).string(
		TAPi18n.__('export.exported_at_date', {lng: translation}) +
		" " + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) +
		"." + ((date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1)) +
		"." + date.getFullYear() +
		" " + TAPi18n.__('export.exported_at', {lng: translation}) +
		" " + (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) +
		":" + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) +
		" " + TAPi18n.__('export.exported_at_time', {lng: translation})
	);
	ws.cell(currentRowIndex, columnsToFormat - 1, currentRowIndex, columnsToFormat, true).string(JSON.stringify(questionGroupObject.serialize()));
	currentRowIndex += 2;

	ws.addImage({
		path: '../web.browser/app/images/arsnova_click_small.png',
		type: 'picture',
		position: {
			type: 'oneCellAnchor',
			from: {
				col: 1,
				colOff: "1.5mm",
				row: 1,
				rowOff: 0
			}
		}
	});

	ws.cell(currentRowIndex, 1).string(TAPi18n.__('export.number_attendees', {lng: translation}) + ":");
	ws.cell(currentRowIndex, 3).number(numberOfAttendees);
	currentRowIndex++;

	ws.cell(currentRowIndex, 1).string(TAPi18n.__('export.average_number_attendees_participated', {lng: translation}) + ":");
	ws.cell(currentRowIndex, 3).number(Math.round((ResponsesCollection.find({hashtag: hashtag}).fetch().length / numberOfAttendees / questionGroup.questionList.length) * 100));
	currentRowIndex++;

	ws.cell(currentRowIndex, 1).string(TAPi18n.__('export.average_correct_answered_questions', {lng: translation}) + ":");
	ws.cell(currentRowIndex, 3).number(leaderboardData.map((x) => {
			return x.correctQuestions.length;
		}).reduce((a, b) => {
			return a + b;
		}, 0) / numberOfAttendees);
	currentRowIndex++;

	ws.cell(currentRowIndex, 1).string(TAPi18n.__('export.average_confidence', {lng: translation}) + ":");
	const averageConfidencePercentage = (leaderboardData.filter((x) => {
		return x.confidenceValue > -1;
	}).map((x) => {
		return x.confidenceValue;
	}).reduce((a, b) => {
		return a + b;
	}, 0) / numberOfAttendees);
	ws.cell(currentRowIndex, 3).number((isNaN(averageConfidencePercentage) ? 0 : Math.round(averageConfidencePercentage)));
	currentRowIndex++;

	ws.cell(currentRowIndex, 1).string(TAPi18n.__('export.average_response_time', {lng: translation}) + ":");
	ws.cell(currentRowIndex, 3).number(Math.round(Number(((leaderboardData.map((x) => {
		return x.responseTime;
	}).reduce((a, b) => {
		return a + b;
	}, 0) / numberOfAttendees) / questionGroup.questionList.length))));
	currentRowIndex += 2;

	let nextColumnIndex = 1;
	ws.cell(currentRowIndex, nextColumnIndex).string(TAPi18n.__("export.attendee_complete_correct", {lng: translation}));
	currentRowIndex += 2;

	ws.cell(currentRowIndex, nextColumnIndex++).string(TAPi18n.__("export.attendee", {lng: translation}));
	if (isCASRequired) {
		ws.cell(currentRowIndex, nextColumnIndex++).string(TAPi18n.__("export.cas_account_id", {lng: translation}));
		ws.cell(currentRowIndex, nextColumnIndex++).string(TAPi18n.__("export.cas_account_email", {lng: translation}));
	}
	ws.cell(currentRowIndex, nextColumnIndex++).string(TAPi18n.__("export.correct_questions", {lng: translation}));
	if (responsesWithConfidenceValue.length > 0) {
		ws.cell(currentRowIndex, nextColumnIndex++).string(TAPi18n.__("export.average_confidence", {lng: translation}));
	}
	ws.cell(currentRowIndex, nextColumnIndex++).string(TAPi18n.__("export.overall_response_time", {lng: translation}));
	ws.cell(currentRowIndex, nextColumnIndex++).string(TAPi18n.__("export.average_response_time", {lng: translation}));
	currentRowIndex++;

	let nextStartRow = currentRowIndex + 5;
	leaderboardData.forEach(function (leaderboardItem, indexInList) {
		let hasNotAllQuestionsCorrect = false;
		questionGroup.questionList.forEach(function (item, index) {
			if (item.type !== "SurveyQuestion" && leaderboardItem.correctQuestions.indexOf((index + 1)) === -1) {
				hasNotAllQuestionsCorrect = true;
			}
		});
		if (hasNotAllQuestionsCorrect) {
			return;
		}
		nextColumnIndex = 1;
		nextStartRow++;
		const targetRow = indexInList + currentRowIndex;
		ws.cell(targetRow, nextColumnIndex++).string(leaderboardItem.nick);
		if (isCASRequired) {
			const profile = Meteor.users.findOne({
				_id: ResponsesCollection.findOne({
					hashtag: hashtag,
					userNick: leaderboardItem.nick
				}).userRef
			}).profile;
			ws.cell(targetRow, nextColumnIndex++).string(profile.id);
			ws.cell(targetRow, nextColumnIndex++).string(profile.mail instanceof Array ? profile.mail.slice(-1)[0] : profile.mail);
		}
		ws.cell(targetRow, nextColumnIndex++).string(leaderboardItem.correctQuestions.join(", "));
		if (responsesWithConfidenceValue.length > 0) {
			ws.cell(targetRow, nextColumnIndex++).number(Math.round(leaderboardItem.confidenceValue));
		}
		ws.cell(targetRow, nextColumnIndex++).number(Math.round(leaderboardItem.responseTime));
		ws.cell(targetRow, nextColumnIndex++).number(Math.round((leaderboardItem.responseTime / leaderboardItem.numberOfEntries)));
	});
	if (nextStartRow === currentRowIndex + 5) {
		ws.cell(currentRowIndex, 1).string(TAPi18n.__("export.attendee_complete_correct_none_available", {lng: translation}));
		nextStartRow++;
	}

	nextColumnIndex = 1;
	ws.cell(nextStartRow, nextColumnIndex).string(TAPi18n.__("export.attendee_all_entries", {lng: translation}));
	nextStartRow += 2;

	ws.cell(nextStartRow, nextColumnIndex++).string(TAPi18n.__("export.attendee", {lng: translation}));
	if (isCASRequired) {
		ws.cell(nextStartRow, nextColumnIndex++).string(TAPi18n.__("export.cas_account_id", {lng: translation}));
		ws.cell(nextStartRow, nextColumnIndex++).string(TAPi18n.__("export.cas_account_email", {lng: translation}));
	}
	ws.cell(nextStartRow, nextColumnIndex++).string(TAPi18n.__("export.correct_questions", {lng: translation}));
	if (responsesWithConfidenceValue.length > 0) {
		ws.cell(nextStartRow, nextColumnIndex++).string(TAPi18n.__("export.average_confidence", {lng: translation}));
	}
	ws.cell(nextStartRow, nextColumnIndex++).string(TAPi18n.__("export.overall_response_time", {lng: translation}));
	ws.cell(nextStartRow++, nextColumnIndex++).string(TAPi18n.__("export.average_response_time", {lng: translation}));

	leaderboardData.forEach(function (leaderboardItem, indexInList) {
		nextColumnIndex = 1;
		const targetRow = indexInList + nextStartRow;
		ws.cell(targetRow, nextColumnIndex++).string(leaderboardItem.nick);
		if (isCASRequired) {
			const profile = Meteor.users.findOne({
				_id: ResponsesCollection.findOne({
					hashtag: hashtag,
					userNick: leaderboardItem.nick
				}).userRef
			}).profile;
			ws.cell(targetRow, nextColumnIndex++).string(profile.id);
			ws.cell(targetRow, nextColumnIndex++).string(profile.mail instanceof Array ? profile.mail.slice(-1)[0] : profile.mail);
		}
		if (leaderboardItem.correctQuestions.length === 0) {
			ws.cell(targetRow, nextColumnIndex++).string(TAPi18n.__("export.correct_questions_none_available", {lng: translation}));
		} else {
			ws.cell(targetRow, nextColumnIndex++).string(leaderboardItem.correctQuestions.join(", "));
		}
		if (responsesWithConfidenceValue.length > 0) {
			ws.cell(targetRow, nextColumnIndex++).number(Math.round(leaderboardItem.confidenceValue));
		}
		ws.cell(targetRow, nextColumnIndex++).number(Math.round(leaderboardItem.responseTime));
		ws.cell(targetRow, nextColumnIndex++).number(Math.round(leaderboardItem.responseTime / leaderboardItem.numberOfEntries));
	});
}

export function generateSheet(wb, {hashtag, translation, defaultStyles}) {
	leaderboardLib.init(hashtag);
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
	const ws = wb.addWorksheet(TAPi18n.__('export.summary', {lng: translation}), Object.assign({}, excelDefaultWorksheetOptions, {
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
	const allResponses = ResponsesCollection.find({hashtag: hashtag});
	const responsesWithConfidenceValue = allResponses.fetch().filter((x) => {
		return x.confidenceValue > -1;
	});
	const leaderboardData = _.sortBy(leaderboardLib.objectToArray(leaderboardLib.getAllLeaderboardItems(true)), function (o) {
		return o.responseTime;
	});
	const numberOfAttendees = distinctValuesFromCollection(ResponsesCollection, 'userNick', {hashtag: hashtag}).length;
	const isCASRequired = SessionConfigurationCollection.findOne({hashtag: hashtag}).nicks.restrictToCASLogin;
	let columnsToFormat = 4;
	if (responsesWithConfidenceValue.length > 0) {
		columnsToFormat++;
	}
	if (isCASRequired) {
		columnsToFormat += 2;
	}

	formatSheet(ws, {
		responsesWithConfidenceValue,
		isCASRequired,
		columnsToFormat,
		questionGroup,
		leaderboardData,
		defaultStyles
	});
	setSheetData(ws, {
		responsesWithConfidenceValue,
		translation,
		isCASRequired,
		questionGroup,
		questionGroupObject,
		hashtag,
		columnsToFormat,
		leaderboardData,
		numberOfAttendees
	});
}
