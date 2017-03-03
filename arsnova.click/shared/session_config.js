/*
 * This file is part of ARSnova Click.
 * Copyright (C) 2016 The ARSnova Team
 *
 * ARSnova Click is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Click is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ARSnova Click.  If not, see <http://www.gnu.org/licenses/>.*/

import {Meteor} from 'meteor/meteor';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {SessionConfigurationCollection} from '/lib/session_configuration/collection.js';
import {AbstractSessionConfiguration} from '/lib/session_configuration/session_config_abstract.js';

Meteor.methods({
	"SessionConfiguration.addConfig": function (sessionConfigObject) {
		if (Meteor.isClient && sessionConfigObject instanceof AbstractSessionConfiguration) {
			sessionConfigObject = sessionConfigObject.serialize();
		}
		SessionConfigurationCollection.update({hashtag: sessionConfigObject.hashtag}, {$set: {
			hashtag: sessionConfigObject.hashtag,
			music: sessionConfigObject.music,
			nicks: sessionConfigObject.nicks,
			theme: sessionConfigObject.theme,
			readingConfirmationEnabled: sessionConfigObject.readingConfirmationEnabled,
			showResponseProgress: sessionConfigObject.showResponseProgress
		}}, {upsert: true});
		EventManagerCollection.update({hashtag: sessionConfigObject.hashtag}, {
			$push: {
				eventStack: {
					key: "SessionConfiguration.addConfig",
					value: {
						hashtag: sessionConfigObject.hashtag,
						music: sessionConfigObject.music,
						nicks: sessionConfigObject.nicks,
						theme: sessionConfigObject.theme,
						readingConfirmationEnabled: sessionConfigObject.readingConfirmationEnabled,
						showResponseProgress: sessionConfigObject.showResponseProgress
					}
				}
			}
		});
	},
	"SessionConfiguration.setConfig": function (sessionConfigObject) {
		if (Meteor.isClient && sessionConfigObject instanceof AbstractSessionConfiguration) {
			sessionConfigObject = sessionConfigObject.serialize();
		}
		SessionConfigurationCollection.update({hashtag: sessionConfigObject.hashtag}, {$set: {
			hashtag: sessionConfigObject.hashtag,
			music: sessionConfigObject.music,
			nicks: sessionConfigObject.nicks,
			theme: sessionConfigObject.theme,
			readingConfirmationEnabled: sessionConfigObject.readingConfirmationEnabled,
			showResponseProgress: sessionConfigObject.showResponseProgress
		}});
		EventManagerCollection.update({hashtag: sessionConfigObject.hashtag}, {
			$push: {
				eventStack: {
					key: "SessionConfiguration.setConfig",
					value: {
						hashtag: sessionConfigObject.hashtag,
						music: sessionConfigObject.music,
						nicks: sessionConfigObject.nicks,
						theme: sessionConfigObject.theme,
						readingConfirmationEnabled: sessionConfigObject.readingConfirmationEnabled,
						showResponseProgress: sessionConfigObject.showResponseProgress
					}
				}
			}
		});
	},
	"SessionConfiguration.setMusic": function (configObject) {
		if (configObject instanceof AbstractSessionConfiguration) {
			configObject = configObject.serialize();
		}
		SessionConfigurationCollection.update({hashtag: configObject.hashtag}, {$set: {music: configObject.music}});
		EventManagerCollection.update({hashtag: configObject.hashtag}, {
			$push: {
				eventStack: {
					key: "SessionConfiguration.setMusic",
					value: {
						music: configObject.music
					}
				}
			}
		});
	},
	"SessionConfiguration.setNicks": function (configObject) {
		if (Meteor.isClient && configObject instanceof AbstractSessionConfiguration) {
			configObject = configObject.serialize();
		}
		SessionConfigurationCollection.update({hashtag: configObject.hashtag}, {$set: {nicks: configObject.nicks}});
		EventManagerCollection.update({hashtag: configObject.hashtag}, {
			$push: {
				eventStack: {
					key: "SessionConfiguration.setNicks",
					value: {
						nicks: configObject.nicks
					}
				}
			}
		});
	},
	"SessionConfiguration.setTheme": function (hashtag, theme) {
		SessionConfigurationCollection.update({hashtag: hashtag}, {$set: {"theme": theme}});
		EventManagerCollection.update({hashtag: hashtag}, {
			$push: {
				eventStack: {
					key: "SessionConfiguration.setTheme",
					value: {
						theme: theme
					}
				}
			}
		});
	},
	"SessionConfiguration.setReadingConfirmationEnabled": function (hashtag, readingConfirmationEnabled) {
		SessionConfigurationCollection.update({hashtag: hashtag}, {$set: {"readingConfirmationEnabled": readingConfirmationEnabled}});
		EventManagerCollection.update({hashtag: hashtag}, {
			$push: {
				eventStack: {
					key: "SessionConfiguration.setReadingConfirmationEnabled",
					value: {
						readingConfirmationEnabled: readingConfirmationEnabled
					}
				}
			}
		});
	},
	"SessionConfiguration.setShowResponseProgress": function (hashtag, showResponseProgress) {
		SessionConfigurationCollection.update({hashtag: hashtag}, {$set: {"showResponseProgress": showResponseProgress}});
		EventManagerCollection.update({hashtag: hashtag}, {
			$push: {
				eventStack: {
					key: "SessionConfiguration.setShowResponseProgress",
					value: {
						showResponseProgress: showResponseProgress
					}
				}
			}
		});
	},
	"SessionConfiguration.setConfidenceSliderEnabled": function (hashtag, confidenceSliderEnabled) {
		SessionConfigurationCollection.update({hashtag: hashtag}, {$set: {"confidenceSliderEnabled": confidenceSliderEnabled}});
		EventManagerCollection.update({hashtag: hashtag}, {
			$push: {
				eventStack: {
					key: "SessionConfiguration.setConfidenceSliderEnabled",
					value: {
						confidenceSliderEnabled: confidenceSliderEnabled
					}
				}
			}
		});
	}
});
