import {DefaultQuestionGroup} from "/lib/questions/questiongroup_default";
import http from 'http';
import https from 'https';
import fs from 'fs';
import mkdirp from 'mkdirp';
import process from 'process';
import path from 'path';
import ytdl from 'ytdl-core';
import vidl from 'vimeo-downloader';

/**
 *
 * @param url
 * @param dest
 * @param cb
 * @source https://stackoverflow.com/a/22907134/7992104
 */
export function download(url, dest, cb) {
	const file = fs.createWriteStream(dest);
	const loader = url.startsWith("https") ? https : http;
	loader.get(url, function (response) {
		response.pipe(file);
		file.on('finish', function () {
			file.close(cb);
		});
	}).on('error', function (err) { // Handle errors
		fs.unlink(dest);
		if (cb) {
			cb(err.message);
		}
	});
}

export function parseQuizdata({quizData, privateKey}) {
	const questionGroup = new DefaultQuestionGroup(quizData);
	const urlsToParse = [];
	const urlParser = /((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*\w)?)/;
	const targetDirectory = `${process.cwd()}/quiz_assets/${privateKey}/${questionGroup.getHashtag()}`;
	const supportedFileTypes = [".gif", ".png", ".mpg", ".jpg", ".jpeg", ".avi"];
	const downloadMatches = [];

	questionGroup.getQuestionList().forEach(function (question) {
		const questiontext = question.getQuestionText().split("\n");
		questiontext.forEach(function (questiontextLine) {
			const match = urlParser.exec(questiontextLine);
			if (match) {
				urlsToParse.push(match[0]);
			}
		});
		question.getAnswerOptionList().forEach(function (answer) {
			const match = urlParser.exec(answer.getAnswerText());
			if (match) {
				urlsToParse.push(match[0]);
			}
		});
	});

	return new Promise(function (resolve) {
		mkdirp(targetDirectory, function () {
			urlsToParse.forEach(function (url) {
				const fileLocation = `${targetDirectory}/${url.substring(url.lastIndexOf("/") + 1)}`;
				try {
					fs.unlink(fileLocation);
				} catch (ex) {}
				if (url.indexOf("youtu") > -1) {
					const video = ytdl(url);
					video.pipe(fs.createWriteStream(fileLocation));
					video.on('complete', function () {
						downloadMatches.push({url, fileLocation});
						if (downloadMatches.length === urlsToParse.length) {
							resolve(downloadMatches);
						}
					});
				} else if (url.indexOf("vimeo") > -1) {
					const video = vidl(url, {quality: '360p'});
					video.pipe(fs.createWriteStream(fileLocation));
					video.on('end', function () {
						downloadMatches.push({url, fileLocation});
						if (downloadMatches.length === urlsToParse.length) {
							resolve(downloadMatches);
						}
					});
				} else {
					download(url, fileLocation, function (error) {
						if (error) {
							console.error(error);
						} else {
							if (supportedFileTypes.indexOf(path.extname(fileLocation)) === -1) {
								console.error(`Unsupported file type, received ${path.extname(fileLocation)}. Valid file types are: ${supportedFileTypes}`);
								fs.unlink(fileLocation);
							} else {
								const fileName = path.basename(fileLocation);
								downloadMatches.push({url, fileLocation, fileName});
								if (downloadMatches.length === urlsToParse.length) {
									resolve(downloadMatches);
								}
							}
						}
					});
				}
			});
		});
	});
}
