
import {Session} from 'meteor/session';
import {Router} from 'meteor/iron:router';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {AnswerOptionCollection} from '/lib/answeroptions/collection.js';
import {ResponsesCollection} from '/lib/responses/collection.js';
import {QuestionGroupCollection} from '/lib/questions/collection.js';

let hashtag = null;
export function init(hashtagVal = Router.current().params.hashtag) {
	hashtag = hashtagVal;
}

function checkIsCorrectSingleChoiceQuestion(response, questionIndex) {
	let hasCorrectAnswer = false;
	AnswerOptionCollection.find({
		isCorrect: true,
		questionIndex: questionIndex,
		inputValue: response.inputValue,
		hashtag: hashtag
	}).fetch().forEach(function (answeroption) {
		hasCorrectAnswer = response.answerOptionNumber.indexOf(answeroption.answerOptionNumber) > -1;
	});
	return hasCorrectAnswer;
}

function checkIsCorrectMultipleChoiceQuestion(response, questionIndex) {
	let hasCorrectAnswer = 0;
	let hasWrongAnswer = 0;
	const allCorrectAnswerOptions = AnswerOptionCollection.find({
		isCorrect: true,
		questionIndex: questionIndex,
		inputValue: response.inputValue,
		hashtag: hashtag
	}).fetch();
	response.answerOptionNumber.every(function (element) {
		const tmpCorrectAnswer = hasCorrectAnswer;
		allCorrectAnswerOptions.every(function (item) {
			if (element === item.answerOptionNumber) {
				hasCorrectAnswer++;
				return false;
			}
			return true;
		});
		if (tmpCorrectAnswer === hasCorrectAnswer) {
			hasWrongAnswer++;
		}
		return true;
	});
	if (hasCorrectAnswer > 0) {
		if (hasWrongAnswer > 0) {
			return 0;
		}
		if (allCorrectAnswerOptions.length === hasCorrectAnswer) {
			return 1;
		} else {
			return 0;
		}
	}
	return -1;
}

function checkIsCorrectRangedQuestion(response, questionIndex) {
	const question = QuestionGroupCollection.findOne({
		hashtag: hashtag
	}).questionList[questionIndex];
	return response.rangedInputValue >= question.rangeMin && response.rangedInputValue <= question.rangeMax;
}

function checkIsCorrectFreeTextQuestion(response, questionIndex) {
	const answerOption = AnswerOptionCollection.findOne({questionIndex: questionIndex}) || Session.get("questionGroup").getQuestionList()[questionIndex].getAnswerOptionList()[0].serialize();
	let	userHasRightAnswers = false;
	if (!answerOption.configCaseSensitive) {
		answerOption.answerText = answerOption.answerText.toLowerCase();
		response.freeTextInputValue = response.freeTextInputValue.toLowerCase();
	}
	if (!answerOption.configUsePunctuation) {
		answerOption.answerText = answerOption.answerText.replace(/(\.)*(,)*(!)*(")*(;)*(\?)*/g, "");
		response.freeTextInputValue = response.freeTextInputValue.replace(/(\.)*(,)*(!)*(")*(;)*(\?)*/g, "");
	}
	if (answerOption.configUseKeywords) {
		if (!answerOption.configTrimWhitespaces) {
			answerOption.answerText = answerOption.answerText.replace(/ /g, "");
			response.freeTextInputValue = response.freeTextInputValue.replace(/ /g, "");
		}
		userHasRightAnswers = answerOption.answerText === response.freeTextInputValue;
	} else {
		let hasCorrectKeywords = true;
		answerOption.answerText.split(" ").forEach(function (keyword) {
			if (response.freeTextInputValue.indexOf(keyword) === -1) {
				hasCorrectKeywords = false;
			}
		});
		userHasRightAnswers = hasCorrectKeywords;
	}
	return userHasRightAnswers;
}

export function isCorrectResponse(response, question, questionIndex) {
	switch (question.type) {
		case "SingleChoiceQuestion":
		case "YesNoSingleChoiceQuestion":
		case "TrueFalseSingleChoiceQuestion":
			return checkIsCorrectSingleChoiceQuestion(response, questionIndex);
		case "MultipleChoiceQuestion":
			return checkIsCorrectMultipleChoiceQuestion(response, questionIndex);
		case "SurveyQuestion":
			return true;
		case "RangedQuestion":
			return checkIsCorrectRangedQuestion(response, questionIndex);
		case "FreeTextQuestion":
			return checkIsCorrectFreeTextQuestion(response, questionIndex);
		default:
			throw new Error("Unsupported question type while checking correct response");
	}
}

export function objectToArray(obj) {
	const keyList = Object.keys(obj);
	return keyList.map(function (value, index) {
		return [{nick: keyList[index], responseTime: obj[value].responseTime, correctQuestions: obj[value].correctQuestions}];
	});
}

export function getLeaderboardItemsByIndex(questionIndex) {
	const question = QuestionGroupCollection.findOne({
		hashtag: hashtag
	}).questionList[questionIndex];
	const result = {};
	if (question.type !== "SurveyQuestion") {
		ResponsesCollection.find({
			hashtag: hashtag,
			questionIndex: questionIndex
		}).forEach(function (item) {
			const isCorrect = isCorrectResponse(item, question, questionIndex);
			if (isCorrect === true || isCorrect > 0) {
				if (typeof result[item.userNick] === "undefined") {
					result[item.userNick] = {
						responseTime: 0,
						correctQuestions: [questionIndex + 1]
					};
				}
				result[item.userNick].responseTime += item.responseTime;
			}
		});
	}
	return result;
}

export function getAllLeaderboardItems(keepAllNicks = false) {
	let allItems = getLeaderboardItemsByIndex(0);
	for (let i = 1; i < EventManagerCollection.findOne().questionIndex + 1; i++) {
		const tmpItems = getLeaderboardItemsByIndex(i);
		for (const o in tmpItems) {
			if (tmpItems.hasOwnProperty(o)) {
				if (typeof allItems[o] === "undefined") {
					allItems[o] = {
						responseTime: 0,
						correctQuestions: []
					};
				}
				allItems[o].responseTime += tmpItems[o].responseTime;
				allItems[o].correctQuestions.push(i + 1);
			}
		}
	}
	if (!keepAllNicks) {
		const questionCount = QuestionGroupCollection.findOne().questionList.filter(function (item) {
			return item.type !== "SurveyQuestion";
		}).length;
		for (const o in allItems) {
			if (allItems.hasOwnProperty(o) && allItems[o].correctQuestions.length !== questionCount) {
				delete allItems[o];
			}
		}
	}
	return allItems;
}
