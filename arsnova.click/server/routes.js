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

import {Router} from 'meteor/iron:router';
import fs from 'fs';
import process from 'process';

Router.route("/server/preview/:themeName/:language", function () {
	const self = this,
		path = process.cwd() + '/arsnova_click_preview_' + self.params.themeName + "_" + self.params.language + '.png';

	fs.access(path, function (error) {
		if (error) {
			/* File not found (perhaps server is currently restarting) */
			self.response.writeHead(404);
			self.response.end("404 - File not found");
		} else {
			fs.readFile(path, function (err, data) {
				if (err) {
					throw err;
				}
				self.response.end(data);
			});
		}
	});
}, {where: "server"});
