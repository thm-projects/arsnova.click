import {EJSON} from 'meteor/ejson';
import {AbstractQuestionGroup} from './questiongroup_abstract.js';

export class DefaultQuestionGroup extends AbstractQuestionGroup {

	constructor (options) {
		super(options);
	}
}

EJSON.addType("DefaultQuestionGroup", function (value) {
	return new DefaultQuestionGroup(value);
});

