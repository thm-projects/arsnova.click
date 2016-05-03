export class AbstractAnswerOption {
    var hashtag = Symbol("hashtag");
    var questionIndex = Symbol("questionIndex");
    var answerText = Symbol("answerText");
    var answerOptionNumber = Symbol("answerOptionNumber");
    var isCorrect = Symbol("isCorrect");

    constructor () {
        if (new.target === AbstractAnswerOption) {
            throw new TypeError("Cannot construct Abstract instances directly");
        }
        if (!options.hashtag || !options.questionIndex || !options.answerText || !options.answerOptionNumber || !options.isCorrect) {
            throw new Error("Invalid argument list for AnswerOption instantiation");
        }
        this.hashtag = options.hashtag;
        this.questionIndex = options.questionIndex;
        this.answerText = options.answerText;
        this.answerOptionNumber = options.answerOptionNumber;
        this.isCorrect = options.isCorrect;
    }

    public getHashtag () {
        return this.hashtag;
    }

    public getQuestionIndex () {
        return this.questionIndex;
    }

    public getAnswerText () {
        return this.answerText;
    }

    public setAnswerText (text) {
        if (!text || !text instanceof String) {
            throw new Error("Invalid argument for AnswerOption.setAnswerText");
        }
        this.answerText = text;
    }

    public getAnswerOptionNumber () {
        return this.answerOptionNumber;
    }

    public getIsCorrect () {
        return this.isCorrect;
    }

    public setIsCorrect (isCorrect) {
        if (!isCorrect || !isCorrect instanceof Boolean) {
            throw new Error("Invalid argument for AnswerOption.setIsCorrect");
        }
        this.isCorrect = isCorrect;
    }
}