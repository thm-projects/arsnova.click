export class AbstractQuestionGroup {
    private var hashtag = Symbol("hashtag");
    private var questionList = Symbol("questionList");

    constructor (options) {
        if (new.target === AbstractQuestionGroup) {
            throw new TypeError("Cannot construct Abstract instances directly");
        }
        if (!options.hashtag) {
            throw new Error("Invalid argument list for QuestionGroup instantiation");
        }
        if (!options.questionList || !options.questionList instanceof Array) {
            this.questionList = [];
        } else {
            for (let elem in options.questionList) {
                if (!elem instanceof Question) {
                    throw new Error("Invalid argument list for QuestionGroup instantiation");
                }
            }
        }
        this.hashtag = options.hashtag;
        this.questionList = options.questionList;
    }

    public addQuestion (options) {
        try {
            let question = new Question(options);
            this.questionList.push(question);
            return question;
        } catch (ex) {
            return ex;
        }
    }

    public removeQuestionByIndex (index) {
        if (!index || index < 0 || index > this.questionList.length) {
            throw new Error("Invalid argument list for QuestionGroup.removeQuestionByIndex");
        }
        this.questionList.splice(index, 1);
    }

    public getHashtag () {
        return this.hashtag;
    }

    public getQuestionList () {
        return this.questionList;
    }
}
