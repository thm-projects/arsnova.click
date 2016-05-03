export class AbstractAnswerOption {
    private var _hashtag = Symbol("_hashtag");
    private var _questionIndex = Symbol("_questionIndex");
    private var _answerText = Symbol("_answerText");
    private var _answerOptionNumber = Symbol("_answerOptionNumber");
    private var _isCorrect = Symbol("_isCorrect");

    constructor (options) {
        if (!options.hashtag || !options.questionIndex || !options.answerText || !options.answerOptionNumber || !options.isCorrect) {
            throw new Error("Invalid argument list for AnswerOption instantiation");
        }
        this._hashtag = options.hashtag;
        this._questionIndex = options.questionIndex;
        this._answerText = options.answerText;
        this._answerOptionNumber = options.answerOptionNumber;
        this._isCorrect = options.isCorrect;
    }

    public getHashtag () {
        return this._hashtag;
    }

    public getQuestionIndex () {
        return this._questionIndex;
    }

    public getAnswerText () {
        return this._answerText;
    }

    public setAnswerText (text) {
        if (!text || !text instanceof String) {
            throw new Error("Invalid argument for AnswerOption.setAnswerText");
        }
        this._answerText = text;
    }

    public getAnswerOptionNumber () {
        return this._answerOptionNumber;
    }

    public getIsCorrect () {
        return this._isCorrect;
    }

    public setIsCorrect (isCorrect) {
        if (!isCorrect || !isCorrect instanceof Boolean) {
            throw new Error("Invalid argument for AnswerOption.setIsCorrect");
        }
        this._isCorrect = isCorrect;
    }
}