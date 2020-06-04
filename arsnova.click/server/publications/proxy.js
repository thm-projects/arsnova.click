import {Meteor} from 'meteor/meteor';
import {ProxyCollection} from '/lib/proxy/collection.js';

Meteor.publish('ProxyCollection.join', function () {
	return ProxyCollection.find();
});
