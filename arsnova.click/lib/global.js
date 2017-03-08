import {_} from 'meteor/underscore';

/**
 * Returns an array containing the distinct values of a given collection
 * @source http://stackoverflow.com/a/37453200
 * @param collection The collection to search for
 * @param field The field which should be distinct
 * @param query optional The query to search in the collection
 * @returns {Array}
 */
export function distinctValuesFromCollection(collection, field, query = {}) {
	return _.uniq(collection.find(query, {
		sort: {[field]: 1}, fields: {[field]: 1}
	}).map(x => x[field]), true);
}
