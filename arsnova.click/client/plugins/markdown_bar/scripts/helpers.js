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
import {urlSchema} from '../scripts/lib.js';

const urlSchemaHelper = {
	getUrlSchema: function () {
		return urlSchema;
	}
};

Template.pictureInsertSplashscreen.helpers($.extend({}, urlSchemaHelper, {}));

Template.markdownBar.helpers({
	getMarkdownBarElements: function () {
		return [
			{id: "boldMarkdownButton", "titleRef": "plugins.markdown_bar.tooltip.bold", "glyphClass": "glyphicon-bold"},
			{
				id: "headerMarkdownButton",
				"titleRef": "plugins.markdown_bar.tooltip.heading",
				"glyphClass": "glyphicon-header"
			},
			{
				id: "hyperlinkMarkdownButton",
				"titleRef": "plugins.markdown_bar.tooltip.hyperlink",
				"glyphClass": "glyphicon-globe"
			},
			{
				id: "unsortedListMarkdownButton",
				"titleRef": "plugins.markdown_bar.tooltip.unordered_list",
				"glyphClass": "iconEditorUl"
			},
			{id: "latexMarkdownButton", "titleRef": "plugins.markdown_bar.tooltip.latex", "glyphClass": "latexIcon"},
			{
				id: "codeMarkdownButton",
				"titleRef": "plugins.markdown_bar.tooltip.code",
				"glyphClass": "codeListingIcon"
			},
			{
				id: "imageMarkdownButton",
				"titleRef": "plugins.markdown_bar.tooltip.image",
				"glyphClass": "glyphicon-picture"
			}
		];
	}
});
