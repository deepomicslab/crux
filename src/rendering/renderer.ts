import { BaseElement } from "../element/base-element";
import { BaseOption } from "../element/base-options";
import { GradientDef, Visualizer } from "../visualizer/visualizer";

export interface Renderer<Context = any> {
    init(v: Visualizer, ctx: Context): void;
    render(element: BaseElement<BaseOption>, ctx: Context): void;
    setSize(v: Visualizer, ctx: Context): void;
    defineGradient(id: string, def: GradientDef, v: Visualizer, ctx: Context): void;
    getGradient(name: string, v: Visualizer, ctx: Context): any;
}

export const renderers: Record<string, Renderer> = {};

export function addRenderer(name: string, r: Renderer) {
    if (renderers[name]) {
        console.warn(`Renderer "${name}" already exists!`);
    }
    renderers[name] = r;
}
