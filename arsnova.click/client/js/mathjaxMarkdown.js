mathjaxMarkdown = {
    initializeMarkdownAndLatex: function () {
        marked.setOptions({
            highlight: function (code) {
                return "<pre class='hljs-pre'><code class='hljs-highlight'>" +
                    hljs.highlightAuto(code).value + "</code></pre>";
            },
            sanitize: true
        });

        this.lexer = new marked.Lexer();
        this.lexer.rules.heading = /^(#{1,6})\s*(.*?)\s*#*\s*(?:\n|$)/;

        /*console.log("config run");
        // mathjax config
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
        };*/
    },
    replaceCodeBlockFromContent: function (content) {
        return content.replace(/<hlcode>([\s\S]*?)<\/hlcode>/g, function (element) {
            var codeBlockMatch = element.match(/^<hlcode>\s*([\s\S]*?)\s*<\/hlcode>$/)[1];
            return "\n```auto\n" + codeBlockMatch + "```\n";
        });
    },
    parseMarkdown: function (content){
        return marked.parser(this.lexer.lex(content));
    }
}