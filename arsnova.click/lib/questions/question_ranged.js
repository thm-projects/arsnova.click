import {AbstractQuestion} from './question_abstract.js';

export class RangedQuestion extends AbstractQuestion {
    private var rangeMin = Symbol("rangeMin");
    private var rangeMax = Symbol("rangeMax");

    constructor (options) {
        super(options);
        this.rangeMin = options.rangeMin || 0;
        this.rangeMax = options.rangeMax || 0;
    }

    public setMaxRange (max) {
        if (!max || max <= this.rangeMin) {
            throw new Error("Invalid argument list for RangedAnswerOption.setMaxRange");
        }
        this.rangeMax = max;
    }

    public setMinRange (min) {
        if (!min || min >= this.rangeMax) {
            throw new Error("Invalid argument list for RangedAnswerOption.setMinRange");
        }
        this.rangeMin = min;
    }

    public setRange (min, max) {
        if (!min || !max || min >= max) {
            throw new Error("Invalid argument list for RangedAnswerOption.setRange");
        }
        this.rangeMin = min;
        this.rangeMax = max;
    }

    public getMaxRange () {
        return this.rangeMax;
    }

    public getMinRange () {
        return this.rangeMin;
    }
}