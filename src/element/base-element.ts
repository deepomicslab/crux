import { Behavior } from "../behavior/behavior";
import { Zoom, ZoomOption } from "../behavior/zoom";
import { GeometryOptions, GeometryUnit, GeometryValue } from "../defs/geometry";
import { SVGRenderable } from "../rendering/svg";
import { VNode } from "../rendering/vdom/vnode";
import { toCartesian } from "../utils/math";
import { defaultUIDGenerator } from "../utils/uid";
import { Visualizer } from "../visualizer/visualizer";
import { BaseOption } from "./base-options";
import { Component } from "./component";

interface State {
    stage?: string | null | undefined;
    [name: string]: any;
}

export abstract class BaseElement<Option extends BaseOption = BaseOption>
    implements SVGRenderable {

    public id: number;
    public uid: number;

    public isRoot = false;
    public isActive = true;
    public parent!: Component; // the direct parent
    public logicalParent?: Component; // parent when rendering
    public vnode?: VNode;

    private _prop: Option;
    public prop!: Option;
    protected state: State = { stage: null } ;

    public $parent?: Component; // the containing renderable component
    public $coord?: Component; // component which defined the root coord system

    public $on: Record<string, any> = {};
    public $styles: Record<string, string> = {};
    public $behavior: Record<string, Behavior> = {};
    public $stages: Record<string, Record<string, any>> = {};
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

    public $v!: Visualizer;

    constructor(id: number) {
        this.id = id;
        this.uid = defaultUIDGenerator.gen();
        this.$geometry = {
            _xOffset: {},
            _yOffset: {},
        } as any;
        this.$defaultProp = this.defaultProp();
        this._prop = {} as Option;
        this.setupPropProxy();
        this.init();
    }

    public init() { /* empty */ }

    public static propNameForInitializer(): string | null { return null; }

    /* properties */

    public defaultProp(): Partial<Option> { return {}; }

    private setupPropProxy() {
        this.prop = new Proxy(this._prop, {
            get: (target, p) => {
                let s: any;
                if (p === "opt") {
                    return target["opt"] || {};
                }
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
            const zoomDef = s.zoom as ZoomOption;
            if (!this.$behavior.zoom) {
                this.$behavior.zoom = new Zoom(this as any, zoomDef);
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

    protected setState(s: Record<string, any>) {
        Object.keys(s).forEach(k => {
            this.state[k] = s[k];
        });
        this.draw();
    }

    public setStage(s: string) {
        this.setState({ stage: s });
    }

    public get stage(): string | null | undefined {
        return this.state.stage;
    }

    public set stage(s: string | null | undefined) {
        this.setState({ stage: s });
    }

    /* drawing */

    public renderTree() {
        return;
    }

    public draw() {
        this.renderTree();
        this.$v.renderer.call(null, this as any);
    }

    /* geometry */

    public positionDetached = false;

    public get inPolorCoordSystem() {
        return this.$coord && this.$coord.$polar;
    }

    public translatePoint(x: number, y: number): [number, number] {
        if (this.inPolorCoordSystem) {
            return toCartesian(x, y);
        }
        return [x, y];
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
    public abstract svgTextContent(): string | null;

    public static geometryProps(): { h: string[], v: string[] } {
        return {
            h: ["x"],
            v: ["y"],
        };
    }

    public get maxX(): number { return (this.$geometry as any).x; }
    public get maxY(): number { return (this.$geometry as any).y; }
    public get layoutWidth(): number { return (this.$geometry as any).width; }
    public get layoutHeight(): number { return (this.$geometry as any).height; }

    /* Hooks */

    public $callHook(name: HookNames) {
        if (this[name])
            this[name].call(this);
    }

    public didCreate?(): void;
    public willUpdate?(): void;
    public didUpdate?(): void;
    public willRender?(): void;
    public didRender?(): void;
    public didLayout?(): void;
    public didLayoutSubTree?(): void;
    public willAdjustAnchor?(): void;

    public didMount?(): void;
    public didPatch?(oldNode: VNode, newNode: VNode): void;
}

type HookNames = "didCreate" |
    "willUpdate" | "didUpdate" |
    "willRender" | "didRender" |
    "didLayout" | "didLayoutSubTree" | "willAdjustAnchor" |
    "didMount" | "didPatch" | "didUnmount" |
    "__didLayout";
