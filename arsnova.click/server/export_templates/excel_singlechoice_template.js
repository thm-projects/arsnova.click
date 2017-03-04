import {TAPi18n} from 'meteor/tap:i18n';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {AnswerOptionCollection} from '/lib/answeroptions/collection.js';
import {ResponsesCollection} from '/lib/responses/collection.js';
import * as leaderboardLib from '/lib/leaderboard.js';
import {excelDefaultWorksheetOptions} from './excel_default_options.js';
import {calculateNumberOfAnswers} from './excel_function_library.js';

export function generateSheet(wb, options, index) {
	const hashtag = options.hashtag;
	const translation = options.translation;
	const questionGroup = QuestionGroupCollection.findOne({hashtag: hashtag});
	const ws = wb.addWorksheet(TAPi18n.__('export.question', {lng: translation}) + ' ' + (index + 1), excelDefaultWorksheetOptions);
	const answerList = questionGroup.questionList[index].answerOptionList;
	ws.row(1).setHeight(20);
	ws.cell(1, 1, 1, (answerList.length + 1)).style({
		fill: {
			type: "pattern",
			patternType: "solid",
			fgColor: "FF000000"
		}
	});
	ws.cell(2, 1, 2, (answerList.length + 1)).style({
		font: {
			color: "FFFFFFFF"
		},
		fill: {
			type: "pattern",
			patternType: "solid",
			fgColor: "FF616161"
		}
	});
	ws.cell(6, 1, 7, (answerList.length + 1)).style({
		font: {
			color: "FF000000"
		},
		fill: {
			type: "pattern",
			patternType: "solid",
			fgColor: "FFC5C5C5"
		}
	});
	ws.cell(9, 1, 9, (answerList.length + 1)).style({
		font: {
			color: "FFFFFFFF"
		},
		fill: {
			type: "pattern",
			patternType: "solid",
			fgColor: "FF616161"
		}
	});
	ws.cell(2, 1).string(TAPi18n.__("export.question", {lng: translation}));
	ws.cell(6, 1).string(TAPi18n.__("export.number_of_answers", {lng: translation}));
	ws.cell(7, 1).string(TAPi18n.__("export.percent_correct", {lng: translation}));
	ws.cell(7, 2).string(

	);

	ws.cell(4, 1).string(questionGroup.questionList[index].questionText);
	for (let j = 0; j < answerList.length; j++) {
		ws.cell(2, (j + 2)).string(TAPi18n.__("export.answer", {lng: translation}) + " " + (j + 1));
		const isAnswerCorrect = AnswerOptionCollection.findOne({hashtag: hashtag, questionIndex: index, answerText: answerList[j].answerText}).isCorrect;
		ws.cell(4, (j + 2)).style({
			font: {
				color: "FFFFFFFF"
			},
			fill: {
				type: "pattern",
				patternType: "solid",
				fgColor: isAnswerCorrect ? "FF008000" : "FFB22222"
			}
		}).string(answerList[j].answerText);
		ws.cell(6, (j + 2)).number(calculateNumberOfAnswers(hashtag, index, j));
	}

	ws.cell(9, 1).string(TAPi18n.__("export.attendee", {lng: translation}));
	ws.cell(9, 2).string(TAPi18n.__("export.answer", {lng: translation}));
	ws.cell(9, 3).string(TAPi18n.__("export.time", {lng: translation}));

	leaderboardLib.init(hashtag);
	const leaderboardData = _.sortBy(leaderboardLib.objectToArray(leaderboardLib.getLeaderboardItemsByIndex(index)), function (o) {
		return o.responseTime;
	});
	for (let j = 0; j < leaderboardData.length; j++) {
		for (let k = 0; k < leaderboardData[j].length; k++) {
			ws.cell(((j * k) + 11), 1, ((j * k) + 11), 3).style({
				font: {
					color: "FF000000"
				},
				fill: {
					type: "pattern",
					patternType: "solid",
					fgColor: "FFC5C5C5"
				}
			});
			ws.cell(((j * k) + 11), 1).string(leaderboardData[j][k].nick);
			const chosenAnswer = AnswerOptionCollection.find({
				hashtag: hashtag,
				questionIndex: index,
				answerOptionNumber: {
					$in: ResponsesCollection.findOne({
						hashtag: hashtag, questionIndex: index
					}).answerOptionNumber
				}
			}).map((x) => {
				return x.answerText;
			});
			const isAnswerCorrect = AnswerOptionCollection.findOne({hashtag: hashtag, questionIndex: index, answerText: chosenAnswer[0]}).isCorrect;
			ws.cell(((j * k) + 11), 2).style({
				font: {
					color: "FFFFFFFF"
				},
				fill: {
					type: "pattern",
					patternType: "solid",
					fgColor: isAnswerCorrect ? "FF008000" : "FFB22222"
				}
			}).string(chosenAnswer);
			ws.cell(((j * k) + 11), 3).number(leaderboardData[j][k].responseTime);
		}
	}
}
