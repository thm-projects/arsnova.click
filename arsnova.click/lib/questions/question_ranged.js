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
		if (typeof max === "undefined" || max <= this[rangeMin]) {
			throw new Error("Invalid argument list for RangedQuestion.setMaxRange");
		}
		this[rangeMax] = max;
	}

	setMinRange (min) {
		if (typeof min === "undefined" || min >= this[rangeMax]) {
			throw new Error("Invalid argument list for RangedQuestion.setMinRange");
		}
		this[rangeMin] = min;
	}

	setRange (min, max) {
		if (typeof min === "undefined" || typeof max === "undefined" || min >= max) {
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

	serialize () {
		let serializeObject = super.serialize();
		serializeObject.rangeMin = this[rangeMin];
		serializeObject.rangeMax = this[rangeMax];
		return serializeObject;
	}

	isValid () {
		return this.getAnswerOptionList().length === 1 && this[rangeMin] < this[rangeMax];
	}

	equals (question) {
		return super.equals(question) && question.getMaxRange() === this[rangeMax] && question.getMinRange() === this[rangeMin];
	}
}
