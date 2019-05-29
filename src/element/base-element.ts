import { VNode } from "snabbdom/vnode";
import { Behavior } from "../behavior/behavior";
import { Zoom } from "../behavior/zoom";
import { GeometryOptions, GeometryUnit, GeometryValue } from "../defs/geometry";
import { SVGRenderable } from "../rendering/svg";
import { defaultUIDGenerator } from "../utils/uid";
import { Visualizer } from "../visualizer/visualizer";
import { BaseOption } from "./base-options";
import { Component } from "./component";

interface State {
    stage: string;
    [name: string]: any;
}

export abstract class BaseElement<Option extends BaseOption = BaseOption>
    implements SVGRenderable {

    public id: number;
    public uid: number;

    public isRoot = false;
    public isActive = true;
    public parent: Component;
    public logicalParent?: Component;
    public vnode: VNode;

    private _prop: Partial<Option>;
    public prop: Partial<Option>;
    protected state: State = { stage: null } ;

    public $parent?: Component;
    public $on: Record<string, any> = {};
    public $styles: Record<string, string> = {};
    public $behavior: Record<string, Behavior> = {};
    public $stages: Record<string, Record<string, any>>;
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
        this._prop = {};
        this.setupPropProxy();
        this.init();
    }

    public init() { /* empty */ }

    public static propNameForInitializer(): string { return null; }

    /* properties */

    public defaultProp(): Partial<Option> { return {}; }

    private setupPropProxy() {
        this.prop = new Proxy(this._prop, {
            get: (target, p) => {
                let s: any;
                if (this.state.stage && (s = this.$stages[this.state.stage]) && (p in s)) {
                    return s[p];
                }
                return target[p];
            },
            set: (target, p, value) => {
                console.warn("this.prop is readonly.");
                return false;
            },
        });
    }

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
            this._prop[k] = value;
        });

        // modifier
        Object.keys(propsWithMods).forEach(m => {
            this._setPropsWithModifier(m, propsWithMods[m]);
        });

        // add default props
        Object.keys(this.$defaultProp).forEach(k => {
            if (!(k in this._prop))
                this._prop[k] = this.$defaultProp[k];
        });
    }

    protected _setPropsWithModifier(mod: string, props: Record<string, any>) {
        // wip
    }

    public parseInternalProps() {
        Object.keys(this._prop).forEach(key => {
            const value = this.prop[key];
            if (typeof value === "function" && "__internal__" in value) {
                this._prop[key] = value.call(this);
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

    public setBehaviors(s: Record<string, Record<string, any>>) {
        if (s.zoom) {
            const zoomDef = s.zoom;
            if (!this.$behavior.zoom) {
                const zoom = this.$behavior.zoom = new Zoom(this as any, zoomDef);
            } else {
                (this.$behavior.zoom as Zoom).updateProps(zoomDef);
            }
        }
    }

    /* event */

    public on(event: string, handler: any) {
        if (!this.$on[event]) this.$on[event] = [];
        this.$on[event].push(handler);
    }

    /* state */

    protected setState(s: any) {
        Object.keys(s).forEach(k => {
            this.state[k] = s[k];
        });
        this.draw();
    }

    public setStage(s: string) {
        this.setState({ stage: s });
    }

    public get stage() {
        return this.state.stage;
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

    protected _geo(val: number, offset: number): GeometryValue {
        return GeometryValue.create(val, GeometryUnit.Percent, offset);
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
    public willRender?(): void;
    public didLayout?(): void;
    public didLayoutSubTree?(): void;
    public willAdjustAnchor?(): void;

    public didMount?(): void;
    public didPatch?(oldNode: VNode, newNode: VNode): void;
}

type HookNames = "didCreate" | "didUpdate" | "willRender" |
    "didLayout" | "didLayoutSubTree" | "willAdjustAnchor" |
    "didMount" | "didPatch";
