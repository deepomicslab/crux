import { compile, Renderer } from "./compiler";

export function template(literals: TemplateStringsArray, ...placeholders: string[]): Renderer {
    let result = "";

    for (let i = 0; i < placeholders.length; i++) {
        result += literals[i];
        result += placeholders[i];
    }
    result += literals[literals.length - 1];

    return compile(result).renderer;
}

type StringLike = string | { toString(): string };

export function internal(literals: TemplateStringsArray, ...placeholders: StringLike[]): string {
    let code = "";

    for (let i = 0; i < placeholders.length; i++) {
        code += literals[i];
        code += `$arg[${i}]`;
    }
    code += literals[literals.length - 1];

    return `__internal__("${code}", [${placeholders.join(",")}])`;
}
