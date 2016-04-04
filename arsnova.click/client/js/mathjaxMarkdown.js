mathjaxMarkdown = {
    initializeMarkdownAndLatex: function () {
        // markdown setup
        marked.setOptions({
            highlight: function (code) {
                return "<pre class='hljs-pre'><code class='hljs-highlight'>" +
                    hljs.highlightAuto(code).value + "</code></pre>";
            },
            sanitize: true
        });

        this.lexer = new marked.Lexer();
        this.lexer.rules.heading = /^(#{1,6})\s*(.*?)\s*#*\s*(?:\n|$)/;

        // mathjax config
        var head = document.getElementsByTagName("head")[0], script;

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

        script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML";
        head.appendChild(script);
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
        var hideMediaDummy = '<div class="hideMediaDummy" accessKey="@@@"><span class="###"></span></div>';

        var replStack = [], repl;

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

        // MathJax parsing
        //MathJax.Queue([function(){}, element]);
    },

    // get all delimiter indices as array of [start(incl), end(excl)] elements
    getDelimiter: function (input, delimiter, endDelimiter) {
        // all lines between the tags to this array
        var result = []; // [start, end]

        var idxStart = 0;
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
    htmlEncode: function(value) {
        return ! value ? value: String(value).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
    }
}