Prism.languages.bvt = {
    'comment': [
        {
            pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
            lookbehind: true
        },
        {
            pattern: /(^|[^\\:])\/\/.*/,
            lookbehind: true,
            greedy: true
        }
    ],
    'string': {
        pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
        greedy: true
    },
    'block': {
        pattern: /\b(svg|canvas|[A-Z]\w*)(\.\w+)*(?=;|\(| *\{)/,
        // lookbehind: true,
        inside: {
            'punctuation': /[\{\(\);]/,
            'tag': /svg|canvas|[A-Z]\w*/,
            'property': /\.\w+/,
        }
    },
    'keyword': /(@(?:if|else|elsif|let|expr|for|yield|props)|\b(in))\b/,
    helper: /@(deg|rad|scaleLinear|scaledX|scaledY)\b/,
    socket: /(?:^| ):\w+(?= *(\(|\{))/,
    'special-block': /\b(behavior|stage):\w+(?= *\{)/,
    'boolean': /\b(?:true|false)\b/,
    'function': {
        pattern: /\b[A-z_][\w\.]*(?= *=)/,
        inside: {
            'punctuation': /[\.]/,
        },
    },
    'number': /\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i,
    'operator': /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
    'punctuation': /[{}[\];(),.:]/
};
