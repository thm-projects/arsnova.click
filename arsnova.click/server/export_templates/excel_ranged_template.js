import {Meteor} from 'meteor/meteor';
import {TAPi18n} from 'meteor/tap:i18n';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {ResponsesCollection} from '/lib/responses/collection.js';
import {SessionConfigurationCollection} from '/lib/session_configuration/collection.js';
import * as leaderboardLib from '/lib/leaderboard.js';
import {excelDefaultWorksheetOptions} from './excel_default_options.js';
import {calculateNumberOfRangedAnswers} from './excel_function_library.js';
import {DefaultQuestionGroup} from '/lib/questions/questiongroup_default.js';

function formatSheet(ws, {responsesWithConfidenceValue, answerList, isCASRequired, questionGroup, allResponses, index, defaultStyles}) {
	const answerCellStyle = {
		alignment: {
			vertical: "center",
			horizontal: "center"
		},
		font: {
			color: "FF000000"
		},
		fill: {
			type: "pattern",
			patternType: "solid",
			fgColor: "FFFFE200"
		}
	};
	let minColums = 3;
	if (responsesWithConfidenceValue.length > 0) {
		minColums++;
	}
	if (isCASRequired) {
		minColums += 2;
	}
	const columnsToFormat = 4 < minColums ? minColums : 4;

	ws.row(1).setHeight(20);
	ws.column(1).setWidth(30);
	ws.column(2).setWidth(20);
	ws.column(3).setWidth(20);
	ws.column(4).setWidth(20);

	ws.cell(1, 1, 1, columnsToFormat).style(defaultStyles.quizNameRowStyle);
	ws.cell(2, 1, 2, columnsToFormat).style(defaultStyles.exportedAtRowStyle);
	ws.cell(2, 2, 2, columnsToFormat).style({
		alignment: {
			horizontal: "center"
		}
	});

	ws.cell(4, 1).style(defaultStyles.questionCellStyle);
	ws.cell(4, 2).style(Object.assign({}, answerCellStyle, {
		border: {
			right: {
				style: "thin",
				color: "black"
			}
		}
	}));
	ws.cell(4, 3).style(Object.assign({}, answerCellStyle, {
		border: {
			right: {
				style: "thin",
				color: "black"
			}
		},
		font: {
			color: "FFFFFFFF"
		},
		fill: {
			type: "pattern",
			patternType: "solid",
			fgColor: "FF008000"
		}
	}));
	ws.cell(4, 4).style(answerCellStyle);

	ws.cell(6, 1, responsesWithConfidenceValue.length > 0 ? 8 : 7, columnsToFormat).style(defaultStyles.statisticsRowStyle);
	ws.cell(6, 2).style(Object.assign({}, defaultStyles.statisticsRowInnerStyle,{
		alignment: {
			horizontal: "center"
		}
	}));
	ws.cell(6, 3).style(Object.assign({}, defaultStyles.statisticsRowInnerStyle,{
		alignment: {
			horizontal: "center"
		}
	}));
	ws.cell(6, 4).style(Object.assign({}, defaultStyles.statisticsRowInnerStyle,{
		alignment: {
			horizontal: "center"
		}
	}));

	ws.cell(7, 1).style(defaultStyles.statisticsRowInnerStyle);
	ws.cell(7, 2).style(Object.assign({}, defaultStyles.statisticsRowInnerStyle,{
		alignment: {
			horizontal: "center"
		}
	}));
	if (responsesWithConfidenceValue.length > 0) {
		ws.cell(8, 1).style(defaultStyles.statisticsRowInnerStyle);
		ws.cell(8, 2).style(Object.assign({}, defaultStyles.statisticsRowInnerStyle,{
			alignment: {
				horizontal: "center"
			}
		}));
	}

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

	ws.cell(11, 1, (allResponses.fetch().length + 10), columnsToFormat).style(defaultStyles.attendeeEntryRowStyle);

	allResponses.forEach(function (responseItem, indexInList) {
		let nextColumnIndex = 2;
		const targetRow = indexInList + 11;
		if (isCASRequired) {
			nextColumnIndex += 2;
		}
		ws.cell(targetRow, nextColumnIndex++).style({
			alignment: {
				horizontal: "center"
			},
			font: {
				color: responseItem.rangedInputValue === questionGroup.questionList[index].correctValue || responseItem.rangedInputValue < questionGroup.questionList[index].rangeMin || responseItem.rangedInputValue > questionGroup.questionList[index].rangeMax ? "FFFFFFFF" : "FF000000"
			},
			fill: {
				type: "pattern",
				patternType: "solid",
				fgColor: responseItem.rangedInputValue === questionGroup.questionList[index].correctValue ? "FF008000" :
					responseItem.rangedInputValue < questionGroup.questionList[index].rangeMin || responseItem.rangedInputValue > questionGroup.questionList[index].rangeMax ? "FFB22222" : "FFFFE200"
			}
		});
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

function setSheetData(ws, {responsesWithConfidenceValue, translation, isCASRequired, questionGroup, questionGroupObject, allResponses, hashtag, index}) {
	const numberOfInputValuesPerGroup = calculateNumberOfRangedAnswers(hashtag, index, questionGroup.questionList[index].rangeMin, questionGroup.questionList[index].correctValue, questionGroup.questionList[index].rangeMax);

	ws.cell(1, 1).string(TAPi18n.__('export.question_type', {lng: translation}) + ': ' + TAPi18n.__(questionGroupObject.getQuestionList()[index].translationReferrer(), {lng: translation}));
	ws.cell(2, 1).string(TAPi18n.__("export.question", {lng: translation}));

	ws.cell(2, 2).string(TAPi18n.__("export.min_range", {lng: translation}));
	ws.cell(2, 3).string(TAPi18n.__("export.correct_value", {lng: translation}));
	ws.cell(2, 4).string(TAPi18n.__("export.max_range", {lng: translation}));

	ws.cell(4, 1).string(questionGroup.questionList[index].questionText);
	ws.cell(4, 2).number(questionGroup.questionList[index].rangeMin);
	ws.cell(4, 3).number(questionGroup.questionList[index].correctValue);
	ws.cell(4, 4).number(questionGroup.questionList[index].rangeMax);

	ws.cell(6, 1).string(TAPi18n.__("export.number_of_answers", {lng: translation}) + ":");
	ws.cell(6, 2).number(numberOfInputValuesPerGroup.minRange);
	ws.cell(6, 3).number(numberOfInputValuesPerGroup.correctValue);
	ws.cell(6, 4).number(numberOfInputValuesPerGroup.maxRange);

	ws.cell(7, 1).string(TAPi18n.__("export.percent_correct", {lng: translation}) + ":");
	ws.cell(7, 2).string(
		(allResponses.fetch().filter((x)=> {return leaderboardLib.isCorrectResponse(x, questionGroup.questionList[index], index) === true;}).length / allResponses.fetch().length * 100) + " %"
	);

	if (responsesWithConfidenceValue.length > 0) {
		ws.cell(8, 1).string(TAPi18n.__("export.average_confidence", {lng: translation}) + ":");
		let confidenceSummary = 0;
		allResponses.forEach(function (item) {
			confidenceSummary += item.confidenceValue;
		});
		ws.cell(8, 2).string((confidenceSummary / responsesWithConfidenceValue.length) + " %");
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

	const sortedResponses = _.sortBy(allResponses.fetch(), function (o) { return o.responseTime; });
	sortedResponses.forEach(function (responseItem, indexInList) {
		nextColumnIndex = 1;
		const targetRow = indexInList + 11;
		ws.cell(targetRow, nextColumnIndex++).string(responseItem.userNick);
		if (isCASRequired) {
			const profile = Meteor.users.findOne({_id: responseItem.userRef}).profile;
			ws.cell(targetRow, nextColumnIndex++).string(profile.id);
			ws.cell(targetRow, nextColumnIndex++).string(profile.mail instanceof Array ? profile.mail.slice(-1)[0] : profile.mail);
		}
		ws.cell(targetRow, nextColumnIndex++).number(responseItem.rangedInputValue);
		if (responsesWithConfidenceValue.length > 0) {
			ws.cell(targetRow, nextColumnIndex++).string(responseItem.confidenceValue + " %");
		}
		ws.cell(targetRow, nextColumnIndex++).number(responseItem.responseTime);
	});
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
	formatSheet(ws, {responsesWithConfidenceValue, answerList, isCASRequired, questionGroup, allResponses, index, defaultStyles});
	setSheetData(ws, {responsesWithConfidenceValue, translation, isCASRequired, questionGroup, questionGroupObject, allResponses, hashtag, index});
}
