import {AbstractQuestion} from './question_abstract.js';

const rangeMin = Symbol("rangeMin");
const rangeMax = Symbol("rangeMax");

export class RangedQuestion extends AbstractQuestion {

	constructor (options) {
		super(options);
		this[rangeMin] = options.rangeMin || 0;
		this[rangeMax] = options.rangeMax || 0;
	}

	setMaxRange (max) {
		if (!max || max <= this[rangeMin]) {
			throw new Error("Invalid argument list for RangedQuestion.setMaxRange");
		}
		this[rangeMax] = max;
	}

	setMinRange (min) {
		if (!min || min >= this[rangeMax]) {
			throw new Error("Invalid argument list for RangedQuestion.setMinRange");
		}
		this[rangeMin] = min;
	}

	setRange (min, max) {
		if (!min || !max || min >= max) {
			throw new Error("Invalid argument list for RangedQuestion.setRange");
		}
		this[rangeMin] = min;
		this[rangeMax] = max;
	}

	getMaxRange () {
		return this[rangeMax];
	}

	getMinRange () {
		return this[rangeMin];
	}

	isValid() {
		return this.getAnswerOptionList().length === 1 && this[rangeMin] < this[rangeMax];
	}
}
