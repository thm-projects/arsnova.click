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

export const mathjaxMarkdown = {
	scriptUrl: "https://arsnova.thm.de/mathjax/MathJax.js",

	initializeMarkdownAndLatex: function () {
		// markdown setup
		var markedRenderer = marked.Renderer;

		markedRenderer.prototype.link = this.hyperlinkRenderer;
		markedRenderer.prototype.image = this.imageRenderer;

		marked.setOptions({
			highlight: function (code) {
				return "<pre class='hljs-pre'><code class='hljs-highlight'>" +
					hljs.highlightAuto(code).value + "</code></pre>";
			},
			sanitize: true,
			breaks: true
		});

		this.lexer = new marked.Lexer();
		this.lexer.rules.heading = /^(#{1,6})\s*(.*?)\s*#*\s*(?:\n|$)/;

		window.MathJax = {
			jax: ["input/TeX", "output/HTML-CSS"],
			extensions: ["tex2jax.js", "Safe.js"],
			TeX: {
				extensions: ["AMSmath.js", "AMSsymbols.js", "noErrors.js", "noUndefined.js"]
			},
			tex2jax: {
				inlineMath: [['\\(', '\\)'], ['\[\[', '\]\]']],
				displayMath: [['$$', '$$'], ['\\[', '\\]']],
				processEscapes: true,
				preview: 'none'
			},
			messageStyle: 'none',
			showProcessingMessages: false,
			showMathMenu: false
		};

		var mathjaxScriptLen = $('scripts[src*="' + this.scriptUrl + '"]').length;

		if (mathjaxScriptLen === 0) {
			// mathjax config
			var head = document.getElementsByTagName("head")[0], script;

			script = document.createElement("script");
			script.type = "text/javascript";
			script.src = this.scriptUrl;
			head.appendChild(script);
		}
	},
	replaceCodeBlockFromContent: function (content) {
		return content.replace(/<hlcode>([\s\S]*?)<\/hlcode>/g, function (element) {
			var codeBlockMatch = element.match(/^<hlcode>\s*([\s\S]*?)\s*<\/hlcode>$/)[1];
			return "\n```auto\n" + codeBlockMatch + "```\n";
		});
	},
	markdownToHtml: function (content) {
		return marked.parser(this.lexer.lex(content));
	},
	getContent: function (content) {
		if (content) {
			var replStack = [], repl = {};

			// replace MathJax delimiters
			var delimiterPairs = MathJax.tex2jax.inlineMath.concat(MathJax.tex2jax.displayMath);
			delimiterPairs.forEach(function (delimiterPair, i) {
				var delimiterPositions = this.getDelimiter(content, delimiterPair[0], delimiterPair[1]);
				replStack.push(repl = this.replaceDelimiter(content, delimiterPositions, '%%MATHJAX' + i + '%%'));
				content = repl.content;
			}, this);

			// replace code block before markdown parsing
			repl.content = this.replaceCodeBlockFromContent(repl.content);

			// converted MarkDown to HTML
			repl.content = this.markdownToHtml(repl.content);

			// undo MathJax delimiter replacements in reverse order
			for (var i = replStack.length - 1; i > 0; i--) {
				replStack[i - 1].content = this.replaceBack(replStack[i]);
			}

			content = this.replaceBack(replStack[0]);

			return content;
		} else {
			return "";
		}
	},

	// add line numbers for syntax highlighted text
	addSyntaxHighlightLineNumbers(element) {
		element.find('.hljs-line-numbers').each(function (index, el) {
			el.parentNode.removeChild(el);
		});

		element.find('.hljs-highlight').each(function (index, el) {
			hljs.lineNumbersBlock(el);
		});
	},

	// get all delimiter indices as array of [start(incl), end(excl)] elements
	getDelimiter: function (input, delimiter, endDelimiter) {
		// all lines between the tags to this array
		var result = []; // [start, end]

		var idxStart;
		var idxEnd = -delimiter.length;
		var run = true;

		while (run) {
			// start delimiter
			idxStart = input.indexOf(delimiter, idxEnd + endDelimiter.length);

			// end delimiter
			idxEnd = input.indexOf(endDelimiter, idxStart + delimiter.length);

			if (idxStart !== -1 && idxEnd !== -1) {
				// add delimiter position values
				result.push([idxStart, idxEnd + endDelimiter.length]);
			} else {
				run = false;
			}
		}
		return result;
	},

	// replace the delimiter with idStrN (returns an array with
	// the input string including all replacements and another array with the replaced content)
	replaceDelimiter: function (input, dArr, idLabel) {
		var result = '';

		var start = 0;

		var replaced = [];

		for (var i = 0; i < dArr.length; ++i) {
			var idxStart = dArr[i][0];
			var idxEnd = dArr[i][1];

			// until start of delimiter
			result = result + input.substring(start, idxStart);

			// set id label
			result += (idLabel + i + 'X');

			// new start becomes old end
			start = idxEnd;

			// store replaced content
			replaced.push(input.substring(idxStart, idxEnd));
		}
		result += input.substring(start);

		return {content: result, source: replaced, label: idLabel};
	},

	// replace the labels back to the contents and return the string
	replaceBack: function (contentReplaced) {
		var content = contentReplaced.content;
		var replaced = contentReplaced.source;

		for (var i = replaced.length - 1; i >= 0; --i) {
			content = this.replaceWithoutRegExp(
				content,
				contentReplaced.label + i + 'X',
				this.htmlEncode(replaced[i])
			);
		}

		return content;
	},

	// replace given variable with the replacement in input without using regular expressions
	replaceWithoutRegExp: function (input, find, replacement) {
		return input.split(find).join(replacement);
	},
	htmlEncode: function (value) {
		return !value ? value : String(value).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
	},
	imageRenderer: function (href, title, text) {
		var isVideoElement = href.indexOf('://i.vimeocdn') > -1 || href.indexOf('://img.youtube') > -1;
		var size = '', alignment = 'center';

		if (title && !isVideoElement) {
			size = title.split('x');
			size[0] = isNaN(size[0]) ? 'initial;' : size[0] + 'px;';
			size[1] = isNaN(size[1]) ? 'initial;' : size[1] + 'px;';
			alignment = size[2] ? size[2] : alignment;

			var maxWitdhOfContainer = $('.modal-markdown-body').width() - 60;

			console.log(maxWitdhOfContainer);
			console.log(size[0] === 'initial;' || maxWitdhOfContainer < size[0]);

			if (size[0] === 'initial;' || maxWitdhOfContainer < size[0]) {
				// width can't be larger than container width and initial equals auto alignment
				size = '"width: 100%"';
			} else {
				size = size[1] && size[1] !== 'inital;' ?
				'"max-width:' + size[0] + 'max-height:' + size[1] + '"' :
				'"max-width:' + size[0] + '"';
			}

			return '<div style="text-align:' + alignment + '">' +
				'<img class="resizeableImage" title="' + text + '" src="' + href + '" alt="' + text + '" style=' + size + '>' +
				'</div>';
		}

		return '<img class="resizeableImage" title="' + text + '" src="' + href + '" alt="' + text + '" style="width: 100%">';
	},
	hyperlinkRenderer: function (href, title, text) {
		var titleDelimiter = /^.*alt="([^"]*)/;
		var content = text;

		var youtubeDelimiters = {
			accessKey: 'youtube',
			videoURI: 'https://www.youtube.com/embed/',
			elementDel: /<img[^<>]*(img.youtube\.com\/vi)[^<>]*>/,
			videoIdDel: /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/,
			titleDel: titleDelimiter
		};

		var vimeoDelimiters = {
			accessKey: 'vimeo',
			videoURI: 'https://player.vimeo.com/video/',
			elementDel: /<img[^<>]*(vimeo)[^<>]*>/,
			videoIdDel: /^.*(vimeo\.com\/video)\/?([0-9]+)/,
			titleDel: titleDelimiter
		};

		var videoElementReplace = function (content, delimiters) {
			return content.replace(delimiters.elementDel, function (element) {
				var videoId = delimiters.accessKey === 'youtube' ?
					href.match(delimiters.videoIdDel)[7] :
					href.match(delimiters.videoIdDel)[2];

				var title = element.match(delimiters.titleDel)[1];
				return '<p class="videoImageParagraph">' +
							'<span class="videoImageContainer" id="' + videoId + '" accesskey="' + delimiters.accessKey + '" title="' + title + '">' + text + '</span>' +
					'</p>';
			});
		};

		content = videoElementReplace(content, youtubeDelimiters);
		content = videoElementReplace(content, vimeoDelimiters);

		if (text === content) {
			content = '<a target="_blank" class=hyperlink" href="' + href + '">' + text + '</a>';
		}

		return content;
	}
};
