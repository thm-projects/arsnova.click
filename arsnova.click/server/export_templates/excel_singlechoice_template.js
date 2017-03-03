import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {AnswerOptionCollection} from '/lib/answeroptions/collection.js';
import {ResponsesCollection} from '/lib/responses/collection.js';
import * as leaderboardLib from '/lib/leaderboard.js';
import {excelDefaultWorksheetOptions} from './excel_default_options.js';
import {calculateNumberOfAnswers} from './excel_function_library.js';

export function generateSheet(wb, hashtag, index) {
	const questionGroup = QuestionGroupCollection.findOne({hashtag: hashtag});
	const ws = wb.addWorksheet('Question ' + (index + 1), excelDefaultWorksheetOptions);
	ws.cell(1, 1, 1, 10).style({
		fill: {
			type: "pattern",
			patternType: "solid",
			bgColor: "black",
			fgColor: "white"
		}
	});
	ws.row(1).setHeight(20);
	ws.cell(2, 1).string("Question");
	ws.cell(6, 1).string("- No. of answers");
	ws.cell(7, 1).string("- % correct");

	ws.cell(4, 1).string(questionGroup.questionList[index].questionText);
	const answerList = questionGroup.questionList[index].answerOptionList;
	for (let j = 0; j < answerList.length; j++) {
		ws.cell(2, (j + 2)).string("Answer " + (j + 1));
		ws.cell(4, (j + 2)).string(answerList[j].answerText);
		ws.cell(6, (j + 2)).number(calculateNumberOfAnswers(hashtag, index, j));
	}

	ws.cell(10, 1).string("Student");
	ws.cell(10, 2).string("Answer");
	ws.cell(10, 3).string("Time");

	leaderboardLib.init(hashtag);
	console.log();
	const leaderboardData = _.sortBy(leaderboardLib.objectToArray(leaderboardLib.getLeaderboardItemsByIndex(index)), function (o) {
		return o.responseTime;
	});
	for (let j = 0; j < leaderboardData.length; j++) {
		for (let k = 0; k < leaderboardData[j].length; k++) {
			ws.cell(((j * k) + 12), 1).string(leaderboardData[j][k].nick);
			ws.cell(((j * k) + 12), 2).string(
				AnswerOptionCollection.find({
					hashtag: hashtag,
					questionIndex: index,
					answerOptionNumber: {
						$in: ResponsesCollection.findOne({
							hashtag: hashtag, questionIndex: index
						}).answerOptionNumber
					}
				}).map((x) => {
					return x.answerText;
				})
			);
			ws.cell(((j * k) + 12), 3).number(leaderboardData[j][k].responseTime);
		}
	}
}
