import {Meteor} from 'meteor/meteor';
import {TAPi18n} from 'meteor/tap:i18n';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {ResponsesCollection} from '/lib/responses/collection.js';
import {SessionConfigurationCollection} from '/lib/session_configuration/collection.js';
import * as leaderboardLib from '/lib/leaderboard.js';
import {excelDefaultWorksheetOptions} from './excel_default_options.js';
import {calculateNumberOfAnswers} from './excel_function_library.js';
import {DefaultQuestionGroup} from '/lib/questions/questiongroup_default.js';

export function generateSheet(wb, options, index) {
	const hashtag = options.hashtag;
	const translation = options.translation;
	const questionGroup = QuestionGroupCollection.findOne({hashtag: hashtag});
	const questionGroupObject = new DefaultQuestionGroup(JSON.parse(JSON.stringify(questionGroup)));
	const ws = wb.addWorksheet(TAPi18n.__('export.question', {lng: translation}) + ' ' + (index + 1), excelDefaultWorksheetOptions);
	const answerList = questionGroup.questionList[index].answerOptionList;
	const allResponses = ResponsesCollection.find({hashtag: hashtag, questionIndex: index});
	const responsesWithConfidenceValue = allResponses.fetch().filter((x)=> {return x.confidenceValue > -1;});
	const isCASRequired = SessionConfigurationCollection.findOne({hashtag: hashtag}).nicks.restrictToCASLogin;
	let minColums = 3;
	if (responsesWithConfidenceValue.length > 0) {
		minColums++;
	}
	if (isCASRequired) {
		minColums += 2;
	}
	const columnsToFormat = answerList.length + 1 < minColums ? minColums : answerList.length + 1;
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
	}).string(TAPi18n.__('export.question_type', {lng: translation}) + ': ' + TAPi18n.__(questionGroupObject.getQuestionList()[index].translationReferrer(), {lng: translation}));
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
	ws.cell(6, 1, 8, columnsToFormat).style({
		font: {
			color: "FF000000"
		},
		fill: {
			type: "pattern",
			patternType: "solid",
			fgColor: "FFC5C5C5"
		}
	});
	ws.cell(10, 1, 10, columnsToFormat).style({
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
	ws.cell(6, 1).style({
		border: {
			bottom: {
				style: "thin",
				color: "black"
			}
		}
	}).string(TAPi18n.__("export.number_of_answers", {lng: translation}) + ":");
	ws.cell(7, 1).style({
		border: {
			bottom: {
				style: "thin",
				color: "black"
			}
		}
	}).string(TAPi18n.__("export.percent_correct", {lng: translation}) + ":");
	ws.cell(7, 2).style({
		alignment: {
			horizontal: "center"
		},
		border: {
			bottom: {
				style: "thin",
				color: "black"
			}
		}
	}).string(
		(allResponses.map((x)=> {return leaderboardLib.isCorrectResponse(x, questionGroup.questionList[index], index);}).length / allResponses.fetch().length * 100) + " %"
	);
	if (responsesWithConfidenceValue.length > 0) {
		ws.cell(8, 1).style({
			border: {
				bottom: {
					style: "thin",
					color: "black"
				}
			}
		}).string(TAPi18n.__("export.average_confidence", {lng: translation}) + ":");
		let confidenceSummary = 0;
		allResponses.forEach(function (item) {
			confidenceSummary += item.confidenceValue;
		});
		ws.cell(8, 2).style({
			alignment: {
				horizontal: "center"
			},
			border: {
				bottom: {
					style: "thin",
					color: "black"
				}
			}
		}).string((confidenceSummary / responsesWithConfidenceValue.length) + " %");
	}
	ws.cell(6, 3).style({
		border: {
			bottom: {
				style: "thin",
				color: "black"
			}
		}
	}).string(TAPi18n.__("view.answeroptions.free_text_question.config_case_sensitive", {lng: translation}) + ": " + TAPi18n.__("global." + (answerList[0].configCaseSensitive ? "yes" : "no"), {lng: translation}));
	ws.cell(6, 4).style({
		border: {
			bottom: {
				style: "thin",
				color: "black"
			}
		}
	}).string(TAPi18n.__("view.answeroptions.free_text_question.config_trim_whitespaces", {lng: translation}) + ": " + TAPi18n.__("global." + (answerList[0].configTrimWhitespaces ? "yes" : "no"), {lng: translation}));
	ws.cell(7, 3).style({
		border: {
			bottom: {
				style: "thin",
				color: "black"
			}
		}
	}).string(TAPi18n.__("view.answeroptions.free_text_question.config_use_keywords", {lng: translation}) + ": " + TAPi18n.__("global." + (answerList[0].configUseKeywords ? "yes" : "no"), {lng: translation}));
	ws.cell(7, 4).style({
		border: {
			bottom: {
				style: "thin",
				color: "black"
			}
		}
	}).string(TAPi18n.__("view.answeroptions.free_text_question.config_use_punctuation", {lng: translation}) + ": " + TAPi18n.__("global." + (answerList[0].configUsePunctuation ? "yes" : "no"), {lng: translation}));

	ws.column(1).setWidth(30);
	ws.column(2).setWidth(30);
	ws.column(3).setWidth(35);
	ws.column(4).setWidth(35);
	ws.cell(4, 1).style({
		alignment: {
			wrapText: true,
			vertical: "top"
		}
	}).string(questionGroup.questionList[index].questionText);
	ws.cell(2, 2).string(TAPi18n.__("export.correct_value", {lng: translation}));
	ws.cell(4, 2).style({
		font: {
			color: "FF000000"
		}
	}).string(questionGroup.questionList[index].answerOptionList[0].answerText);
	ws.cell(6, 2).style({
		alignment: {
			horizontal: "center"
		},
		border: {
			bottom: {
				style: "thin",
				color: "black"
			}
		}
	}).number(calculateNumberOfAnswers(hashtag, index, 0));

	let nextColumnIndex = 1;
	const headerStyle = {
		alignment: {
			wrapText: true,
			horizontal: "center",
			vertical: "center"
		}
	};
	ws.cell(10, nextColumnIndex++).style({
		alignment: {
			vertical: "center"
		}
	}).string(TAPi18n.__("export.attendee", {lng: translation}));
	if (isCASRequired) {
		ws.cell(10, nextColumnIndex++).style(headerStyle).string(TAPi18n.__("export.cas_account_id", {lng: translation}));
		ws.cell(10, nextColumnIndex++).style(headerStyle).string(TAPi18n.__("export.cas_account_email", {lng: translation}));
	}
	ws.cell(10, nextColumnIndex++).style(headerStyle).string(TAPi18n.__("export.answer", {lng: translation}));
	if (responsesWithConfidenceValue.length > 0) {
		ws.cell(10, nextColumnIndex++).style(headerStyle).string(TAPi18n.__("export.confidence_level", {lng: translation}));
	}
	ws.cell(10, nextColumnIndex++).style(headerStyle).string(TAPi18n.__("export.time", {lng: translation}));

	leaderboardLib.init(hashtag);
	ws.cell(12, 1, (allResponses.length + 11), columnsToFormat).style({
		font: {
			color: "FF000000"
		},
		fill: {
			type: "pattern",
			patternType: "solid",
			fgColor: "FFC5C5C5"
		}
	});
	allResponses.forEach(function (responseItem, indexInList) {
		const isCorrectResponse = leaderboardLib.isCorrectResponse(responseItem, questionGroup.questionList[index], index);
		let nextColumnIndex = 1;
		ws.cell(((indexInList) + 12), nextColumnIndex++).string(responseItem.userNick);
		if (isCASRequired) {
			const profile = Meteor.users.findOne({_id: responseItem.userRef}).profile;
			ws.cell(((indexInList) + 12), nextColumnIndex++).string(profile.id);
			ws.cell(((indexInList) + 12), nextColumnIndex++).string(profile.mail instanceof Array ? profile.mail.slice(-1)[0] : profile.mail);
		}
		ws.cell(((indexInList) + 12), nextColumnIndex++).style({
			font: {
				color: "FFFFFFFF"
			},
			fill: {
				type: "pattern",
				patternType: "solid",
				fgColor: isCorrectResponse ? "FF008000" : "FFB22222"
			}
		}).string(responseItem.freeTextInputValue);
		if (responsesWithConfidenceValue.length > 0) {
			ws.cell(((indexInList) + 12), nextColumnIndex++).style({
				alignment: {
					horizontal: "center"
				}
			}).string(responseItem.confidenceValue + "%");
		}
		ws.cell(((indexInList) + 12), nextColumnIndex++).style({
			alignment: {
				horizontal: "center"
			}
		}).number(responseItem.responseTime);
	});
}
