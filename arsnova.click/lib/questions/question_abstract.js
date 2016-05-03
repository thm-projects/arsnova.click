import {AnswerOptionCollection} from '../answeroptions/collection.js';

export class AbstractQuestion {
    private var questionText = Symbol("questionText");
    private var timer = Symbol("timer");
    private var startTime = Symbol("startTime");
    private var questionIndex = Symbol("questionIndex");
    private var answerOptionList = Symbol("answerOptionList");

    constructor (options) {
        if (!options.questionText || !options.timer || !options.startTime || !options.questionIndex) {
            throw new Error("Invalid argument list for Question instantiation");
        }
        this.questionText = options.questionText;
        this.timer = options.timer;
        this.startTime = options.startTime;
        this.questionIndex = options.questionIndex;
        this.answerOptionList = AnswerOptionCollection.find({
            hashtag: options.hashtag,
            questionIndex: options.questionIndex
        }).fetch();
    }

    public setQuestionText (text) {
        if (!text instanceof String || text.length < 5 || text.length > 10000) {
            throw new Error("Invalid argument for Question.setText");
        }
        this.questionText = text;
    }

    public getQuestionText () {
        return this.questionText;
    }

    public getQuestionIndex () {
        return this.questionIndex;
    }

    public setTimer (time) {
        if (!time) {
            throw new Error("Invalid argument for Question.setTimer");
        }
        this.timer = time;
    }

    public getTimer () {
        return this.timer;
    }

    public setStartTime (time) {
        if (!time || new Date(time) <= new Date()) {
            throw new Error("Invalid argument for Question.setStartTime");
        }
        this.startTime = time;
    }

    public getStartTime () {
        return this.startTime;
    }

    public addAnswerOption (answerOption) {
        if (!answerOption || !answerOption instanceof AnswerOption) {
            throw new Error("Invalid argument for Question.removeAnswerOption");
        }
        this.answerOptionList.push(answerOption);
    }

    public removeAnswerOption (index) {
        if (!index || index < 0 || index > this.answerOptionList.length) {
            throw new Error("Invalid argument for Question.removeAnswerOption");
        }
        this.answerOptionList.splice(index);
    }

    public getAnswerOptionList () {
        return this.answerOptionList;
    }
}