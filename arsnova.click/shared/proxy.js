import {Meteor} from 'meteor/meteor';
import {ProxyCollection} from '/lib/proxy/collection.js';

Meteor.methods({
	'ProxyCollection.updateData': function ({hashtag, proxyFiles}) {
		ProxyCollection.update({hashtag: hashtag}, {$set: {proxyFiles: proxyFiles}}, {upsert: true});
	}
});
