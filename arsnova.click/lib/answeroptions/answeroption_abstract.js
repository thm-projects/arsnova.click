const hashtag = Symbol("hashtag");
const questionIndex = Symbol("questionIndex");
const answerText = Symbol("answerText");
const answerOptionNumber = Symbol("answerOptionNumber");

export class AbstractAnswerOption {

	/**
	 * Constructor super method for creating a AnswerOption instance
	 * This method cannot be invoked directly.
	 * @param {{hashtag:String,questionIndex:Number,answerText:String,answerOptionNumber:Number,type:String}} options An object containing the parameters for creating an AnswerOption instance. The type attribute is optional.
	 * @throws {TypeError} If this method is invoked directly, the options Object is undefined or the optional type attribute is not matching the constructor name
	 * @throws {Error} If the hashtag, the questionIndex, the answerText, the answerOptionNumber or the isCorrect attributes of the options Object are missing
	 */
	constructor (options) {
		if (this.constructor === AbstractAnswerOption) {
			throw new TypeError("Cannot construct abstract instances directly");
		}
		if (typeof options.hashtag === "undefined" ||
			typeof options.questionIndex === "undefined" ||
			typeof options.answerText === "undefined" ||
			typeof options.answerOptionNumber === "undefined") {
			throw new Error("Invalid argument list for AnswerOption instantiation");
		}
		this[hashtag] = options.hashtag;
		this[questionIndex] = options.questionIndex;
		this[answerText] = options.answerText;
		this[answerOptionNumber] = options.answerOptionNumber;
	}

	/**
	 * Returns the hashtag identifying the corresponding session
	 * @returns {String} The hashtag of the session this AnswerOption instance belongs to
	 */
	getHashtag () {
		return this[hashtag];
	}

	setHashtag (newHashtag) {
		this[hashtag] = newHashtag;
	}

	/**
	 * Returns the questionIndex this AnswerOption belongs to
	 * @returns {Number} The question index
	 */
	getQuestionIndex () {
		return this[questionIndex];
	}

	/**
	 * Sets the questionIndex this AnswerOption belongs to
	 * @param {Number} index The new index of the question this AnswerOption belongs to
	 */
	setQuestionIndex (index) {
		this[questionIndex] = index;
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

	setAnswerOptionNumber (index) {
		return this[answerOptionNumber] = index;
	}

	/**
	 * Serialize the instance object to a JSON compatible object
	 * @returns {{hashtag: String, type: String, questionIndex: Number, answerText: String, answerOptionNumber: Number}}
	 */
	serialize () {
		return {
			hashtag: this.getHashtag(),
			questionIndex: this.getQuestionIndex(),
			answerText: this.getAnswerText(),
			answerOptionNumber: this.getAnswerOptionNumber()
		};
	}

	/**
	 * Checks if the properties of this instance are valid.
	 * @returns {boolean} True, if the complete Question instance is valid, False otherwise
	 */
	isValid () {
		return this.getAnswerText().replace(/ /g,"").length > 0;
	}

	/**
	 * Gets the validation error reason as a stackable array
	 * @returns {Array} Contains an Object which holds the number of the current answerOption and the reason why the validation has failed
	 */
	getValidationStackTrace () {
		return (this.getAnswerText().length === 0) ? [{occuredAt: {type: "answerOption", id: this.getAnswerOptionNumber()}, reason: "answer_text_empty"}] : [];
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
			answerOption.getAnswerOptionNumber() === this.getAnswerOptionNumber();
	}

	/**
	 * Part of EJSON interface
	 * @see AbstractAnswerOption.serialize()
	 * @see http://docs.meteor.com/api/ejson.html#EJSON-CustomType-toJSONValue
	 * @returns {{hashtag: String, questionIndex: Number, answerText: String, answerOptionNumber: Number}}
	 */
	toJSONValue () {
		return this.serialize();
	}
}
