import {AbstractQuestion} from './question_abstract.js';

export class SingleChoiceQuestion extends AbstractQuestion {
    private var correctAnswers = 0;

    constructor (options) {
        super(options);
    }

    /**
     *
     * @override
     * @param answerOption
     */
    public addAnswerOption (answerOption) {
        if (answerOption.isCorrect) {
            if (this.correctAnswers > 0) {
                throw new Error("This question has already a correct answer");
            } else {
                this.correctAnswers++;
            }
        }
        super.addAnswerOption(answerOption);
    }

    /**
     *
     * @override
     * @param index
     */
    public removeAnswerOption (index) {
        this.correctAnswers--;
        super.removeAnswerOption(index);
    }
}