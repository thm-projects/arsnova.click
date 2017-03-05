import {Meteor} from 'meteor/meteor';
import {TAPi18n} from 'meteor/tap:i18n';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {ResponsesCollection} from '/lib/responses/collection.js';
import {SessionConfigurationCollection} from '/lib/session_configuration/collection.js';
import * as leaderboardLib from '/lib/leaderboard.js';
import {excelDefaultWorksheetOptions} from './excel_default_options.js';
import {DefaultQuestionGroup} from '/lib/questions/questiongroup_default.js';
import {distinctValuesFromCollection} from '/lib/global.js';

export function generateSheet(wb, options) {
	const hashtag = options.hashtag;
	const translation = options.translation;
	const questionGroup = QuestionGroupCollection.findOne({hashtag: hashtag});
	const questionGroupObject = new DefaultQuestionGroup(JSON.parse(JSON.stringify(questionGroup)));
	const ws = wb.addWorksheet(TAPi18n.__('export.summary', {lng: translation}), excelDefaultWorksheetOptions);
	const allResponses = ResponsesCollection.find({hashtag: hashtag});
	const responsesWithConfidenceValue = allResponses.fetch().filter((x)=> {return x.confidenceValue > -1;});
	leaderboardLib.init(hashtag);
	const leaderboardData = _.sortBy(leaderboardLib.objectToArray(leaderboardLib.getAllLeaderboardItems(true)), function (o) { return o.responseTime; })[0];
	const numberOfAttendees = distinctValuesFromCollection(ResponsesCollection, 'userNick', {hashtag: hashtag}).length;
	const isCASRequired = SessionConfigurationCollection.findOne({hashtag: hashtag}).nicks.restrictToCASLogin;
	let columnsToFormat = 4;
	if (responsesWithConfidenceValue.length > 0) {
		columnsToFormat++;
	}
	if (isCASRequired) {
		columnsToFormat += 2;
	}
	const date = new Date();
	ws.row(1).setHeight(20);
	ws.cell(1, 1, 1, columnsToFormat).style({
		font: {
			color: "FFFFFFFF"
		},
		fill: {
			type: "pattern",
			patternType: "solid",
			fgColor: "FF000000"
		}
	});
	ws.cell(1, 1).style({
		alignment: {
			vertical: "center"
		}
	}).string(TAPi18n.__('export.quiz_name', {lng: translation}) + ': ' + TAPi18n.__(questionGroupObject.getHashtag(), {lng: translation}));
	ws.cell(2, 1, 2, columnsToFormat).style({
		font: {
			color: "FFFFFFFF"
		},
		fill: {
			type: "pattern",
			patternType: "solid",
			fgColor: "FF616161"
		}
	});
	ws.cell(2, 1).string(TAPi18n.__('export.exported_at_date', {lng: translation}) + " " + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + "." + ((date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1)) + "." + date.getFullYear());
	ws.cell(1, columnsToFormat).style({
		alignment: {
			vertical: "center"
		}
	}).string(TAPi18n.__('export.session_content', {lng: translation}));
	ws.cell(2, columnsToFormat).string(JSON.stringify(questionGroupObject.serialize()));
	ws.cell(4, 1, 7, columnsToFormat).style({
		font: {
			color: "FF000000"
		},
		fill: {
			type: "pattern",
			patternType: "solid",
			fgColor: "FFC5C5C5"
		}
	});
	ws.cell(4, 1).string(TAPi18n.__('export.number_attendees', {lng: translation}) + ":");
	ws.cell(4, 3).style({
		alignment: {
			horizontal: "left"
		}
	}).number(numberOfAttendees);
	ws.cell(5, 1).string(TAPi18n.__('export.average_correct_answered_questions', {lng: translation}) + ":");
	ws.cell(5, 3).style({
		alignment: {
			horizontal: "left"
		}
	}).number(leaderboardData.map((x)=> {return x.correctQuestions.length;}).reduce((a, b)=> {return a + b;}, 0));
	ws.cell(6, 1).string(TAPi18n.__('export.average_confidence', {lng: translation}) + ":");
	ws.cell(6, 3).style({
		alignment: {
			horizontal: "left"
		}
	}).string((leaderboardData.map((x)=> {return x.confidenceValue;}).reduce((a, b)=> {return a + b;}, 0) / numberOfAttendees).toFixed(2) + "%");
	ws.cell(7, 1).string(TAPi18n.__('export.average_response_time', {lng: translation}) + ":");
	ws.cell(7, 3).style({
		alignment: {
			horizontal: "left"
		},
		numberFormat: '#,##0.00" ms"'
	}).number(Number(((leaderboardData.map((x)=> {return x.responseTime;}).reduce((a, b)=> {return a + b;}, 0) / numberOfAttendees) / questionGroup.questionList.length).toFixed(2)));
	ws.cell(9, 1, 9, columnsToFormat).style({
		font: {
			color: "FFFFFFFF"
		},
		fill: {
			type: "pattern",
			patternType: "solid",
			fgColor: "FF616161"
		}
	});

	ws.column(1).setWidth(30);
	ws.column(2).setWidth(10);
	let i = 3;
	for (i; i < columnsToFormat - 1; i++) {
		ws.column(i).setWidth(20);
	}
	ws.column(i++).setWidth(22);
	ws.column(i++).setWidth(22);

	let nextColumnIndex = 1;
	const headerStyle = {
		alignment: {
			wrapText: true,
			horizontal: "center",
			vertical: "center"
		}
	};
	ws.cell(9, nextColumnIndex++).style({
		alignment: {
			vertical: "center"
		}
	}).string(TAPi18n.__("export.attendee", {lng: translation}));
	if (isCASRequired) {
		ws.cell(9, nextColumnIndex++).style(headerStyle).string(TAPi18n.__("export.cas_account_id", {lng: translation}));
		ws.cell(9, nextColumnIndex++).style(headerStyle).string(TAPi18n.__("export.cas_account_email", {lng: translation}));
	}
	ws.cell(9, nextColumnIndex++).style(headerStyle).string(TAPi18n.__("export.correct_questions", {lng: translation}));
	if (responsesWithConfidenceValue.length > 0) {
		ws.cell(9, nextColumnIndex++).style(headerStyle).string(TAPi18n.__("export.average_confidence", {lng: translation}));
	}
	ws.cell(9, nextColumnIndex++).style(headerStyle).string(TAPi18n.__("export.overall_response_time", {lng: translation}));
	ws.cell(9, nextColumnIndex++).style(headerStyle).string(TAPi18n.__("export.average_response_time", {lng: translation}));

	ws.cell(11, 1, (leaderboardData.length + 10), columnsToFormat).style({
		font: {
			color: "FF000000"
		},
		fill: {
			type: "pattern",
			patternType: "solid",
			fgColor: "FFC5C5C5"
		}
	});
	leaderboardData.forEach(function (leaderboardItem, indexInList) {
		let nextColumnIndex = 1;
		ws.cell(((indexInList) + 11), nextColumnIndex++).string(leaderboardItem.nick);
		if (isCASRequired) {
			const profile = Meteor.users.findOne({_id: ResponsesCollection.findOne({hashtag: hashtag, userNick: leaderboardItem.nick}).userRef}).profile;
			ws.cell(((indexInList) + 11), nextColumnIndex++).string(profile.id);
			ws.cell(((indexInList) + 11), nextColumnIndex++).string(profile.mail instanceof Array ? profile.mail.slice(-1)[0] : profile.mail);
		}
		ws.cell(((indexInList) + 11), nextColumnIndex++).string(leaderboardItem.correctQuestions.join(", "));
		if (responsesWithConfidenceValue.length > 0) {
			ws.cell(((indexInList) + 11), nextColumnIndex++).style({
				alignment: {
					horizontal: "center"
				}
			}).string(leaderboardItem.confidenceValue.toFixed(2) + "%");
		}
		ws.cell(((indexInList) + 11), nextColumnIndex++).style({
			alignment: {
				horizontal: "center"
			},
			numberFormat: "#,##0;"
		}).number(leaderboardItem.responseTime);
		console.log(leaderboardItem);
		ws.cell(((indexInList) + 11), nextColumnIndex++).style({
			alignment: {
				horizontal: "center"
			},
			numberFormat: "#,##0.00;"
		}).number(Number(parseFloat(leaderboardItem.responseTime / leaderboardItem.numberOfEntries).toFixed(2)));
	});
}
