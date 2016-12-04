
export function recalculateIndices(questionGroup, indexFrom, indexTo) {
	if (indexTo > -1 && indexFrom !== indexTo) {
		if (indexFrom < indexTo) {
			for (let i = indexFrom; i < indexTo; i++) {
				const tmpNewPositionElem = questionGroup.getQuestionList()[i + 1];
				if (tmpNewPositionElem) {
					questionGroup.addQuestion(questionGroup.getQuestionList()[i], i + 1);
				}
				questionGroup.addQuestion(tmpNewPositionElem, i);
			}
		} else {
			for (let i = indexFrom; i > indexTo; i--) {
				const tmpNewPositionElem = questionGroup.getQuestionList()[i - 1];
				if (tmpNewPositionElem) {
					questionGroup.addQuestion(questionGroup.getQuestionList()[i], i - 1);
				}
				questionGroup.addQuestion(tmpNewPositionElem, i);
			}
		}
	}
}
