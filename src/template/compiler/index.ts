import { BaseElement } from "../../element/base-element";
import { BaseOption } from "../../element/base-options";
import { ElementDef } from "../../rendering/render-tree";
import { gencode } from "./codegen";
import { parse } from "./parser";

export type Renderer<
    Option extends BaseOption = BaseOption,
    T extends BaseElement<Option> = BaseElement<Option>> = (this: T) => ElementDef;

export interface TemplateMetaData {
    width?: string;
    height?: string;
    rootComponent: string;
    renderer?: string;
}

export function compile(template: string): [Renderer, TemplateMetaData | null] {
    const [ast, metadata] = parse(template);
    const code = gencode(ast);
    return [
        new Function("prop", code) as Renderer,
        metadata,
    ];
}
