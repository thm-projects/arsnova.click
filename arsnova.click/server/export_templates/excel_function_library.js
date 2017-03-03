
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
