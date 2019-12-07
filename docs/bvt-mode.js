var COMMANDS = ["if", "elsif", "else", "for", "let", "expr", "yield", "props"];
var COMPONENT_NAME = /(svg|canvas|[A-Z][A-z0-9\\d_\-]+)/;
var COMPONENT_MOD = /(\.[A-z]+)/;
var NAME = /[a-z_][A-z0-9_\-\.:]*/;
var EXPR = /[\w\.\[\]\d"\(\)]+/;
var ANY_COMMAND = /@if|@elsif|@else|@for|@let|@expr|@yield|@props/;
var bvtMode = function () {
    return {
        startState: function () {
            return {
                contextStack: [],
                stage: 0,
                leftBracketCount: 0,
                leftBracketCount2: 0,
                leftBracketCount3: 0,
                commandName: null,
                context: function () { return this.contextStack[this.contextStack.length - 1] || null; },
                pop: function () { this.contextStack.pop(); },
                push: function (ctx) { this.contextStack.push(ctx); }
            };
        },
        token: function (stream, state) {
            if (stream.sol() && stream.match(/ *\/\//, false)) {
                stream.skipToEnd();
                return "comment";
            }
            switch (state.context()) {
                case null:
                    if (stream.match(COMPONENT_NAME, false)) {
                        state.push("component-name");
                        state.stage = 0;
                        return null;
                    }
                    stream.skipToEnd();
                    return "error";
                case "component-name":
                    return parseComponentName(stream, state);
                case "body":
                    return parseComponentBody(stream, state);
                default:
                    stream.next();
                    return "error";
            }
        }
    };
};
function parseComponentName(stream, state) {
    stream.eatSpace();
    if (state.stage === 0) {
        if (stream.match(COMPONENT_NAME)) {
            return "def";
        }
        else if (stream.match(COMPONENT_MOD)) {
            return "modifier";
        }
        else if (stream.match("(")) {
            state.stage = 1;
            return "bracket";
        }
        else if (stream.match(")")) {
            return "bracket";
        }
        stream.eatSpace();
        if (stream.peek() === "{") {
            state.pop();
            state.push("body");
            state.stage = -1;
            return null;
        }
        if (stream.match(";")) {
            state.pop();
            return "text";
        }
        if (stream.peek() === "\n") {
            state.pop();
        }
    }
    else if (state.stage === 1) {
        return parseEmbeddedValue(stream, state, ")", 0);
    }
    stream.next();
    return "error";
}
function parseComponentBody(stream, state) {
    stream.eatSpace();
    if (state.stage === -1) {
        state.stage = 0;
        if (stream.match("{")) {
            return "bracket";
        }
    }
    else if (state.stage === 0) {
        // namec children block
        if (stream.match(":")) {
            state.stage = 40;
            return "socket";
        }
        // internal block
        if (stream.match(/stage:|behavior:/)) {
            state.stage = 30;
            return "tag";
        }
        // prop
        if (stream.match(NAME)) {
            state.stage = 2;
            return "property";
        }
        // command
        if (stream.match(ANY_COMMAND, false)) {
            state.stage = 11;
            return null;
        }
        // component
        if (stream.match(COMPONENT_NAME, false)) {
            state.push("component-name");
            return null;
        }
        // end
        if (stream.match("}")) {
            state.pop();
            return "bracket";
        }
    }
    else if (state.stage === 2) {
        // =
        if (stream.match("=")) {
            stream.eatSpace();
            state.stage = 3;
            return "text";
        }
    }
    else if (state.stage === 3) {
        // prop value
        return parseEmbeddedValue(stream, state, ";", 0);
    }
    else if (state.stage === 11) {
        // command name
        var commandName_1;
        COMMANDS.forEach(function (cmd) {
            if (stream.match("@" + cmd)) {
                commandName_1 = cmd;
                return;
            }
        });
        if (commandName_1) {
            state.commandName = commandName_1;
            state.stage = 12;
            return "keyword";
        }
        else {
            stream.next();
            return "error";
        }
    }
    else if (state.stage >= 12 && state.stage < 20) {
        return parseCommand(stream, state);
    }
    else if (state.stage === 30) {
        if (stream.match(NAME)) {
            state.push("body");
            state.stage = -1;
            return "tag";
        }
    }
    else if (state.stage === 40) {
        if (stream.match(NAME)) {
            return "socket";
        }
        if (stream.match("(")) {
            state.stage = 41;
            return "bracket";
        }
        if (stream.peek() === "{") {
            state.push("body");
            state.stage = -1;
            return null;
        }
    }
    else if (state.stage === 41) {
        if (stream.match(NAME)) {
            return "variable";
        }
        if (stream.match(")")) {
            state.stage = 40;
            return "bracket";
        }
    }
    stream.skipToEnd();
    state.pop();
    state.stage = 0;
    return "error";
}
function parseEmbeddedValue(stream, state, endBy, previousState) {
    var token;
    if (stream.match(endBy)) {
        if (state.leftBracketCount3 === 0) {
            state.stage = previousState;
            token = "text";
        }
        else {
            state.stage = previousState;
            token = "error";
        }
        state.leftBracketCount = 0;
        state.leftBracketCount2 = 0;
        state.leftBracketCount3 = 0;
    }
    else if (stream.match(/^(true|false|null)/)) {
        token = "builtin";
    }
    else if (stream.match(/^(let|var|const|if|for|while|function) /)) {
        token = "keyword";
    }
    else if (stream.match(/=|\+|\-|\*|\/|\^|\||\&/)) {
        token = "operator";
    }
    else if (stream.match(/".+?"/)) {
        token = "string";
    }
    else if (stream.match(/^[0-9\.]+%?/)) {
        token = "number";
    }
    else if (stream.match("(")) {
        state.leftBracketCount += 1;
        token = "bracket";
    }
    else if (stream.match("[")) {
        state.leftBracketCount2 += 1;
        token = "bracket";
    }
    else if (stream.match("{")) {
        state.leftBracketCount3 += 1;
        token = "bracket";
    }
    else if (stream.match(")")) {
        state.leftBracketCount -= 1;
        token = "bracket";
    }
    else if (stream.match("]")) {
        state.leftBracketCount2 -= 1;
        token = "bracket";
    }
    else if (stream.match("}")) {
        state.leftBracketCount3 -= 1;
        if (endBy === ";") {
            // assume it's inside a block
            if (state.leftBracketCount3 < 0) {
                // block is over
                stream.backUp(1);
                state.stage = previousState;
                state.leftBracketCount = 0;
                state.leftBracketCount2 = 0;
                state.leftBracketCount3 = 0;
                return null;
            }
        }
        token = "bracket";
    }
    if (!token) {
        if (stream.peek().match(/[A-z_]/)) {
            stream.eatWhile(/[A-z0-9_]/);
        } else {
            stream.next();
        }
    }
    if (stream.eol()) {
        if (state.leftBracketCount === 0 && state.leftBracketCount2 === 0 && state.leftBracketCount3 === 0) {
            state.stage = previousState;
        }
    }
    if (token) {
        return token;
    }
    return "text";
}
function parseCommand(stream, state) {
    switch (state.commandName) {
        case "let":
            if (state.stage === 12) {
                stream.eatSpace();
                if (stream.match(NAME)) {
                    state.stage = 13;
                    return "variable";
                }
                stream.next();
                return "error";
            }
            else if (state.stage === 13) {
                stream.eatSpace();
                if (stream.match("=")) {
                    state.stage = 14;
                    return "text";
                }
                stream.next();
                return "error";
            }
            else if (state.stage === 14) {
                return parseEmbeddedValue(stream, state, ";", 0);
            }
        case "expr":
            return parseEmbeddedValue(stream, state, ";", 0);
        case "elsif":
        case "if":
            if (state.stage === 12) {
                return parseEmbeddedValue(stream, state, "{", 13);
            }
            else if (state.stage === 13) {
                state.push("body");
                state.stage = 0;
                return null;
            }
        case "else":
            state.push("body");
            state.stage = 0;
            return null;
        case "for":
            if (state.stage === 12) {
                stream.eatSpace();
                if (stream.match("(")) {
                    state.stage = 13;
                    return "bracket";
                }
                else if (stream.match(NAME)) {
                    state.stage = 14;
                    return "variable";
                }
            }
            else if (state.stage === 13) {
                stream.eatSpace();
                if (stream.match(NAME)) {
                    return "variable";
                }
                else if (stream.match(",")) {
                    return "text";
                }
                else if (stream.match(")")) {
                    state.stage = 14;
                    return "bracket";
                }
            }
            else if (state.stage === 14) {
                stream.eatSpace();
                if (stream.match("in")) {
                    state.stage = 15;
                    return "keyword";
                }
            }
            else if (state.stage === 15) {
                return parseEmbeddedValue(stream, state, "{", 16);
            }
            else if (state.stage === 16) {
                state.push("body");
                state.stage = 0;
                return null;
            }
            stream.skipToEnd();
            state.stage = 0;
            return "error";
        case "props":
            return parseEmbeddedValue(stream, state, ";", 0);
        case "yield":
            if (state.stage === 12) {
                stream.eatSpace();
                if (stream.match(NAME)) {
                    state.stage = 13;
                    return "string";
                }
            }
            else if (state.stage === 13) {
                stream.eatSpace();
                if (stream.peek() === "\n" || stream.eol()) {
                    state.stage = 0;
                    return null;
                }
                if (stream.match("with")) {
                    state.stage = 14;
                    return "keyword";
                }
                if (stream.match("default")) {
                    state.stage = 15;
                    return "keyword";
                }
            }
            else if (state.stage === 14) {
                stream.eatSpace();
                if (stream.match(EXPR)) {
                    if (stream.peek() === "\n" || stream.eol()) {
                        state.stage = 0;
                    }
                    else {
                        state.stage = 13;
                    }
                    return "variable";
                }
            }
            else if (state.stage === 15) {
                state.push("body");
                state.stage = -1;
                return null;
            }
            stream.skipToEnd();
            state.stage = 0;
            return "error";
    }
    return "text";
}

CodeMirror.defineMode("bvt", bvtMode);
