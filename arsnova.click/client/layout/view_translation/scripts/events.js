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

import {Template} from 'meteor/templating';
import {TAPi18n} from 'meteor/tap:i18n';

Template.translate.events({
	'click .available_translations button': function (event) {
		$(event.target).removeClass('button-purple').addClass('button-success').css("box-shadow", "none !important")
			.siblings('[type="button"]')
			.removeClass('input-field-bg-color').addClass('button-purple').css("box-shadow", "1px 1px 5px black");
		return TAPi18n.setLanguageAmplify(this.tag);
	},
	'click #backButton': function () {
		history.back();
	}
});
