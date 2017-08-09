import {Meteor} from 'meteor/meteor';
import {ProxyCollection} from '/lib/proxy/collection.js';

Meteor.methods({
	'ProxyCollection.updateData': function (hashtag, proxyFiles) {
		ProxyCollection.upsert({hashtag: hashtag}, {$set: {proxyFiles: proxyFiles}});
	}
});
