import { VNode } from "snabbdom/vnode";
import { GeometryOptions } from "../defs/geometry";
import { SVGRenderable } from "../rendering/svg";
import { Visualizer } from "../visualizer/visualizer";
import { BaseOption } from "./base-options";
import { Component } from "./component";

export type EventHook = (this: Component) => void;
export interface EventHooks {
    didMount: EventHook;
    didPatch: EventHook;
    didLayout: EventHook;
    didRender: EventHook;
}

export abstract class BaseElement<Option extends BaseOption = BaseOption>
    implements SVGRenderable {

    public uid: number;

    public isRoot = false;
    public parent: Component;
    public vnode: VNode;

    public prop: Partial<Option> = {};
    public $geometry: GeometryOptions<Option>;
    public $hooks: EventHooks;

    private static _geometryProps: [string[], string[]];
    public static get $geometryProps(): [string[], string[]] {
        if (!this._geometryProps) {
            const { h, v } = this.geometryProps();
            this._geometryProps = [h, v];
        }
        return this._geometryProps;
    }

    public $v: Visualizer;

    constructor(uid: number) {
        this.uid = uid;
        this.$geometry = {} as any;
        this.$hooks = {} as any;
        this.init();
    }

    public init() { /* empty */ }

    /* properties */

    public setProp(prop: Partial<Option>) {
        const propsWithMods = {};

        Object.keys(prop).forEach(k => {
            const [name, ...mods] = k.split(".");
            if (mods.length > 0) {
                mods.forEach(m => {
                    if (!(m in propsWithMods)) propsWithMods[m] = {};
                    propsWithMods[m][name] = prop[k];
                });
            }
            this._setProp(k, prop[k]);
        });

        // modifier
        Object.keys(propsWithMods).forEach(m => {
            this._setPropsWithModifier(m, propsWithMods[m]);
        });
    }

    protected _setProp(key: string, value: any) {
        this.prop[key] = value;
    }

    protected _setPropsWithModifier(mod: string, props: Record<string, any>) {
        if (mod === "scaled") {
            let xValue: number, yValue: number;

            // x
            if ("x" in props)
                xValue = this.prop.x = this._scale(props.x, true);
            // y
            if ("y" in props)
                yValue = this.prop.y = this._scale(props.y, false);
            // xEnd
            if ("xEnd" in props) {
                if (xValue === undefined)
                    throw new Error(`Prop "xEnd.scaled" must be supplied together with "x.scaled".`);
                this.prop["width"] = this._scale(props.xEnd, true) - xValue;
            }
            // yEnd
            if ("yEnd" in props) {
                if (xValue === undefined)
                    throw new Error(`Prop "xEnd.scaled" must be supplied together with "x.scaled".`);
                this.prop["height"] = this._scale(props.yEnd, false) - yValue;
            }
            // others
            const [hProp, vProp] = (this.constructor as typeof BaseElement).$geometryProps;
            Object.keys(props).forEach(k => {
                if (k === "x" || k === "y" || k === "xEnd" || k === "yEnd") return;
                const value = props[k];
                this.prop[k] = this._scale(value, !vProp.includes(k));
            });
        }
    }

    public renderTree() {
        return;
    }

    /* scale */

    protected _scale(val: number, horizontal: boolean): number {
        const scale = this.parent.getScale(horizontal);
        return typeof scale === "function" ? scale(val) : val;
    }

    /* svg */

    public abstract svgTagName(): string;
    public abstract svgAttrs(): Record<string, string | number | boolean>;
    public abstract svgTextContent(): string;

    public static geometryProps(): { h: string[], v: string[] } {
        return {
            h: ["x"],
            v: ["y"],
        };
    }

    public get maxX(): number {
        return (this.$geometry as any).x;
    }

    public get maxY(): number {
            return (this.$geometry as any).y;
    }

    /* Hooks */

    public addHook(name: keyof EventHooks, hook: EventHook) {
        this.$hooks[name] = hook;
    }

    public _callHook(name: keyof EventHooks) {
        const hook = this.$hooks[name];
        if (hook) {
            hook.call(this);
        }
    }
}
