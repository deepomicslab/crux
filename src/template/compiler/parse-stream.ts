export class ParserStream {
    public str: string;
    public pos = 0;

    constructor(str: string) {
        this.str = str
            .split("\n")
            .filter(x => !x.match(/ *\/\//))
            .join("\n");
    }

    public advance(step: number) {
        this.pos += step;
        this.str = this.str.substring(step);
    }

    public eof(): boolean {
        return this.str.length === 0;
    }

    public expect(
        token: string,
        desc: string = token,
        testOnly: boolean = false,
    ): RegExpMatchArray {
        const match = this.str.match(new RegExp(`^${token}`));
        if (!match && !testOnly) {
            this._error(`${this.pos}: Expect ${desc}`);
        }
        if (!testOnly) {
            this.advance(match[0].length);
        }
        return match;
    }

    public expectEnd() {
        if (this.str.length > 0) {
            this._error(`Redundant template string: ${this.str}`);
        }
    }

    public skipSpaces(includeNewLines = false) {
        let i = 0;
        while (this.str[i] === " " || this.str[i] === "\t" ||
            (includeNewLines && this.str[i] === "\n")) i++;
        this.advance(i);
    }

    public consumeTill(token: string, consumeEnd = true, checkError = true): string {
        let i = this.str.indexOf(token);
        if (i < 0) {
            if (checkError) {
                this._error(`${this.pos}: Expect ${token}`);
            } else {
                i = this.str.length;
            }
        }
        const result = this.str.substring(0, i);
        this.advance(i + (consumeEnd ? token.length : 0));
        return result;
    }

    public consume(predicate: (ch) => [boolean, boolean], desc: string): string {
        let i = 0;
        while (i < this.str.length) {
            const [end, consume] = predicate(this.str[i]);
            if (end) {
                const result = this.str.substring(0, i);
                this.advance(i + (consume ? 1 : 0));
                return result;
            }
            i++;
        }
        this._error(`Error: Expect ${desc}`);
    }

    public consumeSync(predicate: (ch) => [boolean, boolean], desc: string): string {
        while (!this.eof()) {
            const [end, consume] = predicate(this.str[0]);
            this.advance(consume ? 1 : 0);
            if (end) return;
        }
    }

    public peek(n = 1): string {
        return this.str.substr(0, n);
    }

    public test(token: string): RegExpMatchArray {
        return this.expect(token, null, true);
    }

    public tryApply<T>(token: string, predicate: (p: ParserStream) => T): T {
        if (this.expect(token, null, true)) {
            return ParserStream.call(null, this);
        }
    }

    public tryApplyAny<T>(parserList: Array<[string, (p: ParserStream) => T]>, desc: string): T {
        for (const p of parserList) {
            const [token, parser] = p;
            if (this.expect(token, null, true)) {
                return parser.call(null, this);
            }
        }
        this._error(`${this.pos}: ${desc}. None of the predicates applies.`);
    }

    public _logPos() {
        console.error(this.str.substring(0, 50));
    }

    public _error(msg: string) {
        this._logPos();
        throw new Error(msg);
    }
}
