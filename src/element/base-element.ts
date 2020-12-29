import { getBehavior } from "../behavior";
import { Behavior } from "../behavior/behavior";
import { GeometryOptions, GeometryUnit, GeometryValue } from "../defs/geometry";
import { CanvasRenderable } from "../rendering/canvas/canvas";
import { SVGRenderable } from "../rendering/svg/svg";
import { VNode } from "../rendering/vdom/vnode";
import { toCartesian } from "../utils/math";
import Type, { TypeDef } from "../utils/type-check";
import { defaultUIDGenerator } from "../utils/uid";
import { Visualizer } from "../visualizer/visualizer";
import { BaseOption } from "./base-options";
import { Component } from "./component";

// @ts-ignore
import shallowEqArrays from "shallow-equal/arrays";
// @ts-ignore
import shallowEqObjects from "shallow-equal/objects";
import { scaled } from "./scale";

type ListenerCallback = (n: Record<string, any>) => void;

interface State {
    stage?: string | null | undefined;
    [name: string]: any;
}

export type ElementEventListener = (ev: Event, el: BaseElement<any>) => void;

export abstract class BaseElement<Option extends BaseOption = BaseOption> implements SVGRenderable, CanvasRenderable {
    public _name!: string;
    public id: number | string;
    public uid: number;

    public static propTypes?: Record<string, TypeDef>;

    public isRoot = false;
    public _isActive = true;
    public _order = 0;
    public _reordered = false;
    public parent!: Component; // the direct parent
    public logicalParent?: Component; // parent when rendering

    public vnode?: VNode;
    public path?: Path2D;
    public _gatheredListeners?: Record<string, ElementEventListener | ElementEventListener[]> | null;
    public _isFocused = false;

    public _firstRender = true;
    public _isRenderRoot = false;
    public forceUpdate = false;

    private _prop: Option;
    public prop!: Option;
    protected state: State;
    public _activeState: string | null = null;

    public $parent?: Component; // the containing renderable component
    public $coord?: Component; // component which defined the root coord system
    public isInXScaleSystem = false;
    public isInYScaleSystem = false;

    public $on: Record<string, any> = {};
    public $styles: Record<string, string> = {};
    public $behavior: Record<string, Behavior> = {};
    public $stages: Record<string, Record<string, any>> = {};
    public $geometry: GeometryOptions<Option>;
    public $defaultProp: Partial<Option> = {};
    public $geometryProps: [string[], string[]] = [[], []];
    public $geometryPropsSet!: Set<string>;

    public $detached = false;

    public $v!: Visualizer;
    // tslint:disable-next-line: variable-name
    public __insertHook: any;
    // tslint:disable-next-line: variable-name
    public __updateHook: any;

    constructor(id: number | string = 0) {
        this.id = id;
        this.uid = defaultUIDGenerator.gen();
        this.$geometry = {
            _xOffset: {},
            _yOffset: {},
        } as any;
        this._prop = {} as Option;
        this.setupPropProxy();
        this.init();

        if (!this!.state) {
            this.state = { stage: null };
        } else if (!("stage" in this.state)) {
            this.state.stage = null;
        }
    }

    public init() {
        /* empty */
    }

    public static propNameForInitializer(): string | null {
        return null;
    }

    public __didCreate() {
        this.$defaultProp = this.defaultProp();
        const { h, v } = this.geometryProps();
        this.$geometryProps = [h, v];
        this.$geometryPropsSet = new Set([...h, ...v]);
    }

    /* properties */

    public defaultProp(): Partial<Option> {
        return {};
    }

    private setupPropProxy() {
        this.prop = new Proxy(this._prop, {
            get: (target, p) => {
                let s: any;
                if (p === "opt") {
                    return target["opt"] || {};
                }
                if (this._activeState && (s = this.$stages[this._activeState]) && p in s) {
                    return s[p];
                }
                if (p in target) {
                    return target[p];
                }
                return this.$defaultProp[p];
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
    }

    protected _setPropsWithModifier(mod: string, props: Record<string, any>) {
        // wip
    }

    public compareProps(p: Record<string, any>): boolean {
        const k1 = Object.keys(p); // , k2 = Object.keys(this._prop);
        // if (!shallowEqArrays(k1, k2)) return false;
        let k, p1: any, p2: any, t1, t2;
        for (k of k1) {
            p1 = p[k];
            p2 = this._prop[k];
            if (this.$geometryPropsSet.has(k)) {
                if (typeof p1 === "number" && typeof p2 === "number") {
                    if (p1 !== p2) return false;
                    continue;
                }
                return false;
            }
            if (k === "opt") {
                const p1k = Object.keys(p1);
                if (p1k.length !== Object.keys(p2).length) return false;
                // tslint:disable-next-line: no-for-in-array
                for (const n in p1k) {
                    if (!shallowEqObjects(p1[n], p2[n])) return false;
                }
                continue;
            }
            t1 = typeof p1;
            t2 = typeof p2;
            if (t1 !== t2) return false;
            switch (t1) {
                case "string":
                case "number":
                case "undefined":
                case "boolean":
                case "function":
                case "bigint":
                case "symbol":
                    if (p1 !== p2) return false;
                    continue;
                default:
                    if (Array.isArray(p1)) {
                        if (Array.isArray(p2) && shallowEqArrays(p1, p2)) {
                            continue;
                        }
                        return false;
                    }
                    if (!shallowEqObjects(p1, p2)) return false;
                    continue;
            }
        }
        return true;
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
        Object.keys(s).forEach(k => {
            const behavior = getBehavior(k);
            if (!behavior) {
                throw new Error(`Unknown behavior: ${k}`);
            }
            const def = s[k];
            if (this.$behavior[k]) {
                this.$behavior[k].updateProps(def);
            } else {
                this.$behavior[k] = new behavior(this as any, def);
            }
        });
    }

    public performTypeCheck() {
        if ((this.constructor as typeof BaseElement).propTypes) {
            Object.keys(this._prop).forEach(k => {
                const t = (this.constructor as typeof BaseElement).propTypes![k];
                if (t !== undefined) {
                    const [result, error] = Type.check(this._prop[k], t);
                    if (!result) {
                        console.error(`Type checking failed for prop "${k}".\n${Type.trace(error!)}`);
                    }
                }
            });
        }
    }

    /* event */

    public on(event: string, handler: any) {
        if (!this.$on[event]) this.$on[event] = [];
        this.$on[event].push(handler);
    }

    /* state */

    public _findActiveStage() {
        if (this.stage) {
            this._activeState = this.stage;
            return;
        }
        let el = this.parent;
        while (el && !el.render) {
            if (el.stage) {
                this._activeState = el.stage;
                return;
            }
            el = el.parent;
        }
        this._activeState = null;
    }

    protected setState(s: Record<string, any>) {
        const changedKeys: string[] = [];
        Object.keys(s).forEach(k => {
            if (this.state[k] === s[k]) return;
            this.state[k] = s[k];
            changedKeys.push(k);
        });

        const callbackSymbols = changedKeys.flatMap(k => this._stateListeners[k]).filter(Boolean);
        for (const sym of new Set(callbackSymbols)) {
            this._stateCallbacks[sym].call(this, this.state, changedKeys);
        }

        let elm: BaseElement<any> | null = null;
        if (this instanceof Component) {
            if (typeof this.render === "function") {
                elm = this;
            } else if (this.$parent) {
                elm = this.$parent;
            }
        } else {
            elm = this;
        }

        if (elm) {
            elm.redraw();
        }
    }

    private _stateListeners: Record<string, symbol[]> = {};
    private _stateCallbacks: Record<symbol, ListenerCallback> = {};
    protected watchState(s: string | string[], callback: ListenerCallback) {
        const keys = Array.isArray(s) ? s : [s];
        const cbKey = Symbol();
        this._stateCallbacks[cbKey] = callback;
        for (const key of keys) {
            if (!this._stateListeners[key]) this._stateListeners[key] = [];
            this._stateListeners[key].push(cbKey);
        }
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

    private _boundMethods = new Map();
    protected _bindMethod(m: any) {
        let bound;
        if ((bound = this._boundMethods.get(m))) return bound;
        bound = m.bind(this);
        this._boundMethods.set(m, bound);
        return bound;
    }

    protected _b(m: any, ...args: any[]) {
        return [this._bindMethod(m), ...args];
    }

    /* drawing */

    public renderTree() {
        this._findActiveStage();
    }

    public draw() {
        this._isRenderRoot = true;
        this.renderTree();
        this.$v.renderer.render(this as any, this.$v.rendererCtx);
        this.$callHook("didPaint");
        this._isRenderRoot = false;
    }

    public shouldDraw() {
        if (this.$v._isInTransaction) {
            this.$v._changedElements.add(this);
            return false;
        }
        return true;
    }

    private _hasBufferedRedraw = false;
    private _isReDrawing = false;

    public redraw() {
        if (!this.shouldDraw()) {
            return;
        }
        if (this.$v.isCanavs) {
            this._hasBufferedRedraw = true;
            if (!this._isReDrawing) {
                window.requestAnimationFrame(this._performRedraw.bind(this));
            }
        } else {
            this.draw();
        }
    }

    private _performRedraw() {
        this._hasBufferedRedraw = false;
        this._isReDrawing = true;
        if (this.shouldDraw()) this.draw();
        if (!this._hasBufferedRedraw) {
            this._isReDrawing = false;
            return;
        }
        window.requestAnimationFrame(this._performRedraw.bind(this));
    }

    /* geometry */

    public positionDetached = false;

    public get inPolorCoordSystem() {
        return this.$coord && this.$coord.$polar;
    }

    public translatePoint(x: number, y: number): [number, number] {
        if (this.inPolorCoordSystem) {
            return toCartesian(x, y, this.$coord!.$polar!.rad);
        }
        return [x, y];
    }

    /* scale */

    protected _scale(val: number, horizontal: boolean): number {
        if (this.$parent) {
            if (horizontal) this.$parent.isInXScaleSystem = true;
            else this.$parent.isInYScaleSystem = true;
        }
        if (horizontal) this.isInXScaleSystem = true;
        else this.isInYScaleSystem = true;
        const scale = this.parent.getScale(horizontal);
        return typeof scale === "function" ? scaled(scale, val) : val;
    }

    protected _rotate(val: number, x: number, y: number) {
        return [val, typeof x === "number" ? x : "_", typeof y === "number" ? y : "_"];
    }

    protected _geo(val: number, offset: number): GeometryValue {
        return GeometryValue.create(val, GeometryUnit.Percent, offset);
    }

    /* svg */

    public abstract svgTagName(): string;
    public abstract svgAttrs(): Record<string, string | number | boolean>;
    public abstract svgTextContent(): string | null;

    /* canvas */
    public abstract renderToCanvas(ctx: CanvasRenderingContext2D): void;

    public geometryProps(): { h: string[]; v: string[] } {
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
    public get layoutWidth(): number {
        return (this.$geometry as any).width;
    }
    public get layoutHeight(): number {
        return (this.$geometry as any).height;
    }

    /* Hooks */

    public $callHook(name: HookNames) {
        let hook: any;
        if ((hook = this[`__${name}`])) hook.call(this);
        if ((hook = this[name])) hook.call(this);
    }

    public didCreate?(): void;
    public shouldUpdate?(): boolean;
    public willUpdate?(): void;
    public didUpdate?(): void;
    public willRender?(): void;
    public didRender?(): void;
    public didPaint?(): void;
    public didLayout?(): void;
    public didLayoutSubTree?(): void;
    public willAdjustAnchor?(): void;

    public didMount?(): void;
    public didPatch?(oldNode: VNode, newNode: VNode): void;
}

type HookNames =
    | "didCreate"
    | "willUpdate"
    | "didUpdate"
    | "willRender"
    | "didRender"
    | "didPaint"
    | "didLayout"
    | "didLayoutSubTree"
    | "willAdjustAnchor"
    | "didMount"
    | "didPatch"
    | "didUnmount";
