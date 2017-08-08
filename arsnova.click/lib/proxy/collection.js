import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {hashtagSchema} from '../hashtags/collection.js';

export const ProxyCollection = new Mongo.Collection("proxy");

export const ProxyCollectionSchema = new SimpleSchema({
	hashtag: {
		type: hashtagSchema
	},
	proxyFiles: {
		type: [Object]
	},
	"proxyFiles.$.url": {
		type: String
	},
	"proxyFiles.$.fileLocation": {
		type: String
	},
	"proxyFiles.$.fileName": {
		type: String
	}
});

ProxyCollection.attachSchema(ProxyCollectionSchema);
