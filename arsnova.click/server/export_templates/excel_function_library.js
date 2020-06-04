import {ResponsesCollection} from '/lib/responses/collection.js';

export function calculateNumberOfAnswers(hashtag, index, answeroptionNumber) {
	let numberOfAnswers = 0;
	ResponsesCollection.find({hashtag: hashtag, questionIndex: index}).fetch().forEach(function (item) {
		if (item.answerOptionNumber.indexOf(answeroptionNumber) > -1) {
			numberOfAnswers++;
		}
	});
	return numberOfAnswers;
}

export function calculateNumberOfRangedAnswers(hashtag, index, minRange, correctValue, maxRange) {
	let numberOfAnswersInMinRange = 0;
	let numberOfAnswersInMaxRange = 0;
	let numberOfCorrectAnswers = 0;
	ResponsesCollection.find({hashtag: hashtag, questionIndex: index}).fetch().forEach(function (item) {
		if (item.rangedInputValue <= maxRange && item.rangedInputValue > correctValue) {
			numberOfAnswersInMaxRange++;
		} else if (item.rangedInputValue === correctValue) {
			numberOfCorrectAnswers++;
		} else if (item.rangedInputValue >= minRange) {
			numberOfAnswersInMinRange++;
		}
	});
	return {
		minRange: numberOfAnswersInMinRange,
		correctValue: numberOfCorrectAnswers,
		maxRange: numberOfAnswersInMaxRange
	};
}
