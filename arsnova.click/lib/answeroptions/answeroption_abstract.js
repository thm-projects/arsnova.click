const hashtag = Symbol("hashtag");
const questionIndex = Symbol("questionIndex");
const answerText = Symbol("answerText");
const answerOptionNumber = Symbol("answerOptionNumber");
const isCorrect = Symbol("isCorrect");

export class AbstractAnswerOption {

	/**
	 * Constructor super method for creating a AnswerOption instance
	 * This method cannot be invoked directly.
	 * @param {{hashtag:String,questionIndex:Number,answerText:String,answerOptionNumber:Number,isCorrect:Boolean,type:Number}} options An object containing the parameters for creating an AnswerOption instance. The type attribute is optional.
	 * @throws {TypeError} If this method is invoked directly, the options Object is undefined or the optional type attribute is not matching the constructor name
	 * @throws {Error} If the hashtag, the questionIndex, the answerText, the answerOptionNumber or the isCorrect attributes of the options Object are missing
	 */
	constructor (options) {
		if (this.constructor === AbstractAnswerOption) {
			throw new TypeError("Cannot construct Abstract instances directly");
		}
		if (typeof options.type !== "undefined" && options.type !== this.constructor.name) {
			throw new TypeError("Invalid construction type");
		}
		if (typeof options.hashtag === "undefined" || typeof options.questionIndex === "undefined" || typeof options.answerText === "undefined" || typeof options.answerOptionNumber === "undefined" || typeof options.isCorrect === "undefined") {
			throw new Error("Invalid argument list for AnswerOption instantiation");
		}
		this[hashtag] = options.hashtag;
		this[questionIndex] = options.questionIndex;
		this[answerText] = options.answerText;
		this[answerOptionNumber] = options.answerOptionNumber;
		this[isCorrect] = options.isCorrect;
	}

	/**
	 * Returns the hashtag identifying the corresponding session
	 * @returns {String} The hashtag of the session this AnswerOption instance belongs to
	 */
	getHashtag () {
		return this[hashtag];
	}

	/**
	 * Returns the questionIndex this AnswerOption belongs to
	 * @returns {Number} The question index
	 */
	getQuestionIndex () {
		return this[questionIndex];
	}

	/**
	 * Returns the currently set answer text displayed during a quiz
	 * @returns {String} The answer text which will be displayed during a quiz
	 */
	getAnswerText () {
		return this[answerText];
	}

	/**
	 * Sets the answer text for this AnswerOption instance
	 * @param {String} text The text which shall be displayed during a quiz
	 * @throws {Error} If the text is not of type String
	 */
	setAnswerText (text) {
		if (typeof text !== "string") {
			throw new Error("Invalid argument for AnswerOption.setAnswerText");
		}
		this[answerText] = text;
	}

	/**
	 * Returns the answerOptionNumber identifying this AnswerOption instance
	 * @returns {Number} The answerOptionNumber of this AnswerOption instance
	 */
	getAnswerOptionNumber () {
		return this[answerOptionNumber];
	}

	/**
	 * Returns whether this AnswerOption instance is currently marked as correct
	 * @returns {Boolean} True if this AnswerOption instance is marked as correct, False otherwise
	 */
	getIsCorrect () {
		return this[isCorrect];
	}

	/**
	 * Set the correct-mark for this AnswerOption instance
	 * @param {Boolean} value True, if this AnswerOption shall be marked as correct, False otherwise
	 * @throws {Error} If the value is not of type Boolean
	 */
	setIsCorrect (value) {
		if (typeof value !== "boolean") {
			throw new Error("Invalid argument for AnswerOption.setIsCorrect");
		}
		this[isCorrect] = value;
	}

	/**
	 * Serialize the instance object to a JSON compatible object
	 * @returns {{hashtag: String, type: String, questionIndex: Number, answerText: String, answerOptionNumber: Number, isCorrect: Boolean}}
	 */
	serialize () {
		return {
			hashtag: this.getHashtag(),
			type: this.constructor.name,
			questionIndex: this.getQuestionIndex(),
			answerText: this.getAnswerText(),
			answerOptionNumber: this.getAnswerOptionNumber(),
			isCorrect: this.getIsCorrect()
		};
	}

	/**
	 * Checks if the properties of this instance are valid.
	 * @returns {boolean} True, if the complete Question instance is valid, False otherwise
	 */
	isValid () {
		return this.getAnswerText().length > 0;
	}

	/**
	 * Checks for equivalence relations to another AnswerOption instance. Also part of the EJSON interface
	 * @see http://docs.meteor.com/api/ejson.html#EJSON-CustomType-equals
	 * @param {AbstractAnswerOption} answerOption The AnswerOption instance which should be checked
	 * @returns {boolean} True if both instances are completely equal, False otherwise
	 */
	equals (answerOption) {
		return answerOption instanceof AbstractAnswerOption &&
			answerOption.getQuestionIndex() === this.getQuestionIndex() &&
			answerOption.getAnswerText() === this.getAnswerText() &&
			answerOption.getAnswerOptionNumber() === this.getAnswerOptionNumber() &&
			answerOption.getIsCorrect() === this.getIsCorrect();
	}

	/**
	 * Part of EJSON interface.
	 * @see http://docs.meteor.com/api/ejson.html#EJSON-CustomType-typeName
	 * @returns {String} The name of the instantiated subclass
	 */
	typeName () {
		return this.constructor.name;
	}

	/**
	 * Part of EJSON interface
	 * @see AbstractAnswerOption.serialize()
	 * @see http://docs.meteor.com/api/ejson.html#EJSON-CustomType-toJSONValue
	 * @returns {{hashtag: String, questionIndex: Number, answerText: String, answerOptionNumber: Number, isCorrect: Boolean}}
	 */
	toJSONValue () {
		return {
			hashtag: this.getHashtag(),
			questionIndex: this.getQuestionIndex(),
			answerText: this.getAnswerText(),
			answerOptionNumber: this.getAnswerOptionNumber(),
			isCorrect: this.getIsCorrect()
		};
	}
}
