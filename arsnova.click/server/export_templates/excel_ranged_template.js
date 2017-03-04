import {TAPi18n} from 'meteor/tap:i18n';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {ResponsesCollection} from '/lib/responses/collection.js';
import * as leaderboardLib from '/lib/leaderboard.js';
import {excelDefaultWorksheetOptions} from './excel_default_options.js';
import {calculateNumberOfRangedAnswers} from './excel_function_library.js';
import {DefaultQuestionGroup} from '/lib/questions/questiongroup_default.js';

export function generateSheet(wb, options, index) {
	const hashtag = options.hashtag;
	const translation = options.translation;
	const questionGroup = QuestionGroupCollection.findOne({hashtag: hashtag});
	const questionGroupObject = new DefaultQuestionGroup(JSON.parse(JSON.stringify(questionGroup)));
	const ws = wb.addWorksheet(TAPi18n.__('export.question', {lng: translation}) + ' ' + (index + 1), excelDefaultWorksheetOptions);
	const answerList = questionGroup.questionList[index].answerOptionList;
	const allResponses = ResponsesCollection.find({hashtag: hashtag, questionIndex: index});
	const responsesWithConfidenceValue = allResponses.map((x)=> {return x.confidenceValue > -1;});
	const columnsToFormat = answerList.length < 4 ? 4 : answerList.length + 1;
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
		}).string(TAPi18n.__("export.percent_confidence", {lng: translation}) + ":");
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

	ws.column(1).setWidth(30);
	ws.cell(4, 1).style({
		alignment: {
			wrapText: true,
			vertical: "top"
		}
	}).string(questionGroup.questionList[index].questionText);
	ws.cell(2, 2).string(TAPi18n.__("export.min_range", {lng: translation}));
	ws.cell(2, 3).string(TAPi18n.__("export.correct_value", {lng: translation}));
	ws.cell(2, 4).string(TAPi18n.__("export.max_range", {lng: translation}));
	ws.column(2).setWidth(20);
	ws.column(3).setWidth(20);
	ws.column(4).setWidth(20);
	const numberOfInputValuesPerGroup = calculateNumberOfRangedAnswers(hashtag, index, questionGroup.questionList[index].rangeMin, questionGroup.questionList[index].correctValue, questionGroup.questionList[index].rangeMax);
	ws.cell(4, 2).style({
		alignment: {
			vertical: "center",
			horizontal: "center"
		},
		font: {
			color: "FF000000"
		},
		border: {
			right: {
				style: "thin",
				color: "black"
			}
		},
		fill: {
			type: "pattern",
			patternType: "solid",
			fgColor: "FFFFE200"
		}
	}).number(questionGroup.questionList[index].rangeMin);
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
	}).number(numberOfInputValuesPerGroup.minRange);
	ws.cell(4, 3).style({
		alignment: {
			vertical: "center",
			horizontal: "center"
		},
		font: {
			color: "FFFFFFFF"
		},
		border: {
			right: {
				style: "thin",
				color: "black"
			}
		},
		fill: {
			type: "pattern",
			patternType: "solid",
			fgColor: "FF008000"
		}
	}).number(questionGroup.questionList[index].correctValue);
	ws.cell(6, 3).style({
		alignment: {
			horizontal: "center"
		},
		border: {
			bottom: {
				style: "thin",
				color: "black"
			}
		}
	}).number(numberOfInputValuesPerGroup.correctValue);
	ws.cell(4, 4).style({
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
	}).number(questionGroup.questionList[index].rangeMax);
	ws.cell(6, 4).style({
		alignment: {
			horizontal: "center"
		},
		border: {
			bottom: {
				style: "thin",
				color: "black"
			}
		}
	}).number(numberOfInputValuesPerGroup.maxRange);

	let nextColumnIndex = 1;
	ws.cell(10, nextColumnIndex++).string(TAPi18n.__("export.attendee", {lng: translation}));
	ws.cell(10, nextColumnIndex++).string(TAPi18n.__("export.answer", {lng: translation}));
	if (responsesWithConfidenceValue.length > 0) {
		ws.cell(10, nextColumnIndex++).string(TAPi18n.__("export.confidence_level", {lng: translation}));
	}
	ws.cell(10, nextColumnIndex++).string(TAPi18n.__("export.time", {lng: translation}));

	leaderboardLib.init(hashtag);
	allResponses.forEach(function (responseItem, indexInList) {
		let nextColumnIndex = 1;
		ws.cell(((indexInList) + 12), 1, ((indexInList) + 12), columnsToFormat).style({
			font: {
				color: "FF000000"
			},
			fill: {
				type: "pattern",
				patternType: "solid",
				fgColor: "FFC5C5C5"
			}
		});
		ws.cell(((indexInList) + 12), nextColumnIndex++).string(responseItem.userNick);
		ws.cell(((indexInList) + 12), nextColumnIndex++).style({
			alignment: {
				horizontal: "center"
			},
			font: {
				color: responseItem.rangedInputValue >= questionGroup.questionList[index].rangeMin || responseItem.rangedInputValue <= questionGroup.questionList[index].rangeMax ? "FF000000" : "FFFFFFFF"
			},
			fill: {
				type: "pattern",
				patternType: "solid",
				fgColor: responseItem.rangedInputValue === questionGroup.questionList[index].correctValue ? "FF008000" :
					responseItem.rangedInputValue >= questionGroup.questionList[index].rangeMin || responseItem.rangedInputValue <= questionGroup.questionList[index].rangeMax ? "FFFFE200" : "FFB22222"
			}
		}).number(responseItem.rangedInputValue);
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
