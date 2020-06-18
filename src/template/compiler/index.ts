import { BaseElement } from "../../element/base-element";
import { BaseOption } from "../../element/base-options";
import { ElementDef } from "../../rendering/element-def";
import { gencode } from "./codegen";
import { parse } from "./parser";

export type Renderer<Option extends BaseOption = BaseOption, T extends BaseElement<Option> = BaseElement<Option>> = (
    this: T,
) => ElementDef;

export interface TemplateMetaData {
    width?: string;
    height?: string;
    theme?: string;
    rootComponent: string;
    renderer?: string;
}

export function compile(template: string, extended = false) {
    const [ast, metadata, commands] = parse(template, extended);
    const code = gencode(ast);
    return {
        renderer: new Function("prop", code) as Renderer,
        commands,
        metadata,
    };
}
