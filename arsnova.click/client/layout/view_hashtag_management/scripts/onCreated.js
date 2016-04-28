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

import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import {EventManager} from '/lib/eventmanager.js';
import {Hashtags} from '/lib/hashtags.js';

import * as localData from '/client/lib/local_storage.js';

Template.hashtagView.onCreated(function () {
	this.subscribe('Hashtags.public', ()=> {
		Hashtags.find().observeChanges({
			added: function (id, doc) {
				if (doc.hashtag === $("#hashtag-input-field").val()) {
					$("#addNewHashtag").attr("disabled", "disabled");
				}
			}
		});
	});
	this.autorun(()=> {
		this.subscribe("EventManager.join", Session.get("hashtag"), ()=> {
			if (!EventManager.findOne({hashtag: Session.get("hashtag")}) || localData.containsHashtag(Session.get("hashtag")) > -1) {
				$("#joinSession").attr("disabled", "disabled");
				return;
			}
			EventManager.find().observeChanges({
				changed: function (id, changedFields) {
					if (!isNaN(changedFields.sessionStatus)) {
						if (changedFields.sessionStatus === 2) {
							$("#joinSession").removeAttr("disabled");
						} else {
							$("#joinSession").attr("disabled", "disabled");
						}
					}
				},
				added: function (id, doc) {
					if (!isNaN(doc.sessionStatus)) {
						if (doc.sessionStatus === 2) {
							$("#joinSession").removeAttr("disabled");
						} else {
							$("#joinSession").attr("disabled", "disabled");
						}
					}
				}
			});
		});
	});
});

Template.hashtagManagement.onCreated(function () {
	this.subscribe('Hashtags.public');
});
