import { VNode } from "snabbdom/vnode";
import { GeometryOptions } from "../defs/geometry";
import { SVGRenderable } from "../rendering/svg";
import { defaultUIDGenerator } from "../utils/uid";
import { Visualizer } from "../visualizer/visualizer";
import { BaseOption } from "./base-options";
import { Component } from "./component";

export abstract class BaseElement<Option extends BaseOption = BaseOption>
    implements SVGRenderable {

    public id: number;
    public uid: number;

    public isRoot = false;
    public isActive = true;
    public parent: Component;
    public logicalParent?: Component;
    public vnode: VNode;

    public prop: Partial<Option> = {};
    protected state: any;

    public $on: Record<string, any> = {};
    public $styles: Record<string, string> = {};
    public $geometry: GeometryOptions<Option>;
    public $defaultProp: Partial<Option>;

    public $detached = false;

    private static _geometryProps: [string[], string[]];
    public static get $geometryProps(): [string[], string[]] {
        if (!this._geometryProps) {
            const { h, v } = this.geometryProps();
            this._geometryProps = [h, v];
        }
        return this._geometryProps;
    }

    public $v: Visualizer;

    constructor(id: number) {
        this.id = id;
        this.uid = defaultUIDGenerator.gen();
        this.$geometry = {} as any;
        this.$defaultProp = this.defaultProp();
        this.init();
    }

    public init() { /* empty */ }

    public static propNameForInitializer(): string { return null; }

    /* properties */

    public defaultProp(): Partial<Option> { return {}; }

    public setProp(prop: Partial<Option>) {
        const propsWithMods = {};

        Object.keys(prop).forEach(k => {
            const value = prop[k];
            if (typeof value === "undefined") return;
            const [name, ...mods] = k.split(".");
            if (mods.length > 0) {
                mods.forEach(m => {
                    if (!(m in propsWithMods)) propsWithMods[m] = {};
                    propsWithMods[m][name] = value;
                });
            }
            this._setProp(k, value);
        });

        // modifier
        Object.keys(propsWithMods).forEach(m => {
            this._setPropsWithModifier(m, propsWithMods[m]);
        });

        // add default props
        Object.keys(this.$defaultProp).forEach(k => {
            if (!(k in this.prop))
                this.prop[k] = this.$defaultProp[k];
        });
    }

    protected _setProp(key: string, value: any) {
        this.prop[key] = value;
    }

    protected _setPropsWithModifier(mod: string, props: Record<string, any>) {
        if (mod === "scaled") {
            let xValue: number, yValue: number;

            // x
            if ("x" in props) {
                xValue = this.prop.x = this._scale(props.x, true);
            }
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
            // if nested
            if ("x.scaled" in this.parent.prop) {
                (this.prop.x as number) -= this.parent.$geometry.x;
            }
            if ("y.scaled" in this.parent.prop) {
                (this.prop.y as number) -= this.parent.$geometry.y;
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

    public parseInternalProps() {
        Object.keys(this.prop).forEach(key => {
            const value = this.prop[key];
            if (typeof value === "object" && "__internal__" in value) {
                this.prop[key] = this[value.name].apply(this, value.args);
            }
        });
        this.$detached = !!this.prop.detached;
    }

    public setEventHandlers(h: Record<string, any>) {
        Object.keys(h).forEach(k => {
            const v = h[k];
            this.$on[k] = typeof v === "object" && v.handler ? this[v.handler] : v;
        });
    }

    public setStyles(s: Record<string, string>) {
        this.$styles = s;
    }

    /* state */

    protected setState(s: any) {
        Object.keys(s).forEach(k => {
            this.state[k] = s[k];
        });
        this.draw();
    }

    /* drawing */

    public renderTree() {
        return;
    }

    public draw() {
        this.renderTree();
        this.$v.renderer.call(null, this);
    }

    /* scale */

    protected _scale(val: number, horizontal: boolean): number {
        const scale = this.parent.getScale(horizontal);
        return typeof scale === "function" ? scale(val) : val;
    }

    protected _rotate(val: number) {
        return [val, (this.$geometry as any).x, (this.$geometry as any).y];
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

    public get maxX(): number { return (this.$geometry as any).x; }
    public get maxY(): number { return (this.$geometry as any).y; }

    /* Hooks */

    public $callHook(name: HookNames) {
        if (this[name])
            this[name].call(this);
    }

    public didCreate?(): void;
    public didUpdate?(): void;
    public didLayout?(): void;
    public didLayoutSubTree?(): void;
    public willAdjustAnchor?(): void;

    public didMount?(): void;
    public didPatch?(oldNode: VNode, newNode: VNode): void;
}

type HookNames = "didCreate" | "didUpdate" |
    "didLayout" | "didLayoutSubTree" | "willAdjustAnchor" |
    "didMount" | "didPatch";
