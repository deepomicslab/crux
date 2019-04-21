import { compile, Renderer } from "./compiler";

export function template(literals: TemplateStringsArray, ...placeholders: string[]): Renderer {
    let result = "";

    for (let i = 0; i < placeholders.length; i++) {
        result += literals[i];
        result += placeholders[i];
    }
    result += literals[literals.length - 1];

    return compile(result)[0];
}
