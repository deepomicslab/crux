const _any = Symbol("any");
const _number = Symbol("number");
const _string = Symbol("string");
const _array = Symbol("array");
const _object = Symbol("object");
const _function = Symbol("function");

const type = Symbol("type");

type CustomChecker = (obj: any) => [boolean, string?];

type _Optional = {
    [type]: "optional";
    t: TypeDef;
};

type _ArrayOf = {
    [type]: "arrayOf";
    t: TypeDef;
    len: number;
};

type _Enum = {
    [type]: "enum";
    t: TypeDef[];
};

type _Custom = {
    [type]: "custom";
    desc: string;
    checker: CustomChecker;
};

export type TypeDef =
    | number
    | string
    | typeof _any
    | typeof _number
    | typeof _string
    | typeof _array
    | typeof _object
    | typeof _function
    | TypeDef[]
    | { [k: string]: TypeDef }
    | _Optional
    | _ArrayOf
    | _Enum
    | _Custom;

interface ErrorInfo {
    obj: any;
    message: string;
}

function fail(obj: any, t: TypeDef | null, msg: string = "", prev: ErrorInfo[] = []): [false, ErrorInfo[]] {
    const message = t === null ? msg : (msg ? `${msg}; ` : "") + `expected ${d(t)}`;
    return [false, [{ obj, message }, ...prev]];
}

function check(obj: any, t: TypeDef): [true] | [false, ErrorInfo[]] {
    if (t === _any) {
        return [true];
    } else if (t === _number) {
        return typeof obj === "number" ? [true] : fail(obj, t);
    } else if (t === _string) {
        return typeof obj === "string" ? [true] : fail(obj, t);
    } else if (t === _array) {
        return Array.isArray(obj) ? [true] : fail(obj, t);
    } else if (t === _object) {
        return typeof obj === "object" ? [true] : fail(obj, t);
    } else if (t === _function) {
        return typeof obj === "function" ? [true] : fail(obj, t);
    } else if (Array.isArray(t)) {
        if (!Array.isArray(obj)) return fail(obj, t, `the value is not an array`);
        if (obj.length !== t.length) return fail(obj, t, `the array should have a length of ${t.length}`);
        for (let i = 0; i < obj.length; i++) {
            const [r, s] = check(obj[i], t[i]);
            if (!r) return fail(obj, null, `at index ${i}`, s);
        }
        return [true];
    } else {
        if (typeof t === "number" || typeof t === "string") {
            return obj === t ? [true] : fail(obj, t);
        }
        if (type in t) {
            // type def
            switch (t[type]) {
                case "optional":
                    if (obj === null || obj === undefined) return [true];
                    const [r, s] = check(obj, (t as _Optional).t);
                    if (!r) return [false, s!];
                    return [true];
                case "arrayOf":
                    if (!Array.isArray(obj)) return fail(obj, t, `the value is not an array`);
                    if ((t as _ArrayOf).len >= 0 && (t as _ArrayOf).len !== obj.length)
                        return fail(obj, t, `the array should have a length of ${(t as _ArrayOf).len}`);
                    for (let i = 0; i < obj.length; i++) {
                        const [r, s] = check(obj[i], (t as _ArrayOf).t);
                        if (!r) return fail(obj, null, `at index ${i}`, s);
                    }
                    return [true];
                case "enum":
                    for (const m of (t as _Enum).t) {
                        if (check(obj, m)[0]) return [true];
                    }
                    return fail(obj, t);
                case "custom":
                    const [r_, s_] = (t as _Custom).checker(obj);
                    return r_ ? [true] : fail(obj, t, s_);
                default:
                    return fail(obj, null, `unknown format`);
            }
        } else {
            // object literial
            if (typeof obj !== "object") return fail(obj, t, `the value is not an object`);
            for (const k of Object.keys(t)) {
                if (!(k in obj)) return fail(obj, t, `key ${k} does not exist`);
                const [r, s] = check(obj[k], t[k]);
                if (!r) return fail(obj, null, `at key "${k}"`, s);
            }
            return [true];
        }
    }
}

const dMap = {
    [_any]: "any",
    [_number]: "number",
    [_string]: "string",
    [_array]: "Array",
    [_object]: "Object",
    [_function]: "Function",
} as const;

function d(t: TypeDef): string {
    if (typeof t === "symbol" && t in dMap) return dMap[t as any];
    if (typeof t === "string") return `"${t}"`;
    if (typeof t === "number") return `${t}`;
    if (Array.isArray(t)) {
        return `[${t.map(x => d(x)).join(", ")}]`;
    }
    // @ts-ignore
    if (type in t) {
        switch (t[type]) {
            case "optional":
                return `${d((t as _Optional).t)}, null or undefined`;
            case "arrayOf":
                return `Array<${d((t as _ArrayOf).t)}>`;
            case "enum":
                return `(any of ${(t as _Enum).t.map(x => d(x)).join(", ")})`;
            case "custom":
                return (t as _Custom).desc;
            default:
                return `Unknown format`;
        }
    } else {
        return `{ ${Object.entries(t)
            .map(([k, v]) => `${k}: ${d(v)}`)
            .join(", ")} }`;
    }
}

function trace(msg: ErrorInfo[]) {
    let indent = 0;
    let str = "";
    for (const m of msg) {
        const objDesc = typeof m.obj === "object" || Array.isArray(m.obj) ? JSON.stringify(m.obj) : m.obj;
        for (let i = indent; i > 0; i--) str += "    ";
        str += `When checking ${objDesc}: \n`;
        for (let i = indent; i > 0; i--) str += "    ";
        str += m.message + "\n";
        indent += 1;
    }
    return str;
}

const color: _Custom = {
    [type]: "custom",
    checker(obj) {
        return [typeof obj === "string" || obj instanceof CanvasGradient];
    },
    desc: "color",
};

const geoValue: _Custom = {
    [type]: "custom",
    checker(obj) {
        return [typeof obj === "number" || (typeof obj === "object" && "value" in obj && "unit" in obj)];
    },
    desc: "geometry value",
};

const Type = {
    any: _any,
    function: _function,
    number: _number,
    string: _string,
    array: _array,
    object: _object,
    color,
    geoValue,
    arrayOf(t: TypeDef, len: number = -1): _ArrayOf {
        return { [type]: "arrayOf", t, len };
    },
    anyOf(...args: TypeDef[]): _Enum {
        return { [type]: "enum", t: args };
    },
    optional(t: TypeDef): _Optional {
        return { [type]: "optional", t };
    },
    custom(checker: CustomChecker, desc: string = "custom value"): _Custom {
        return { [type]: "custom", checker, desc };
    },
    check,
    trace,
} as const;

export default Type;
