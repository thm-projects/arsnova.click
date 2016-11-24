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
