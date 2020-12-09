import { GeometryValue } from "../defs/geometry";
import { BaseElement } from "../element/base-element";
import { Component } from "../element/component";
import { registerDefaultGlobalComponents } from "../element/global";
import { addRenderer, Renderer, renderers } from "../rendering/renderer";
import { compile } from "../template/compiler";
import { ExtCommand } from "../template/compiler/parser/sfv";
import { RootComponent } from "./root";

import canvasRenderer from "../rendering/canvas/canvas";
import svgOfflineRenderer from "../rendering/svg-offline/svg-offline";
import svgRenderer from "../rendering/svg/svg";
import IS_NODE from "../utils/is-node";

addRenderer("canvas", canvasRenderer);
addRenderer("svg", svgRenderer);
addRenderer("svg-offline", svgOfflineRenderer);

export interface VisualizerOption {
    el: string;
    template?: string;
    singleTemplate?: boolean;
    props?: Record<string, any>;
    data?: Record<string, any>;
    root?: Component;
    components?: Record<string, any /*typeof Component*/>;
    renderer?: "canvas" | "svg";
    rendererOption?: any;
    width?: number | "auto";
    height?: number | "auto";
    theme?: string;
}

export class Visualizer {
    public static uidCounter = 0;

    public uid: number;
    public container?: Element;
    public root!: BaseElement;
    public size!: { width: number; height: number };
    public components: Record<string, typeof Component>;

    public extCommands!: ExtCommand[];

    public rendererType: "svg" | "canvas";
    public renderer: Renderer;
    public rendererCtx: any;
    public rendererOpt: any;

    public theme: string;

    private _data: Record<string, any>;
    private _dataProxy!: Record<string, any>;

    public _registeredEvents: Set<string>;
    public _focusedElements: Set<BaseElement> = new Set();
    public _currentCursor: string | null = null;

    public forceRedraw = false;
    public _isInTransaction = false;
    private _queuedTransactions: (() => void)[] = [];
    public _changedElements: Set<BaseElement<any>> = new Set();

    private firstRun = true;

    public get data() {
        return this._dataProxy;
    }
    public set data(d) {
        this._data = d;
        Object.keys(this._data).forEach(k => (this.root[k] = this._data[k]));
        this._createDataProxy();
        if (!this.firstRun) this.run();
    }

    private _createDataProxy() {
        this._dataProxy = new Proxy(this._data, {
            get: (target: any, p: string) => {
                return target[p];
            },
            set: (target: any, p: string, val: any) => {
                target[p] = val;
                this.root[p] = val;
                return true;
            },
        });
    }

    constructor(opt: VisualizerOption) {
        this.uid = Visualizer.uidCounter++;
        this._registeredEvents = new Set();

        if (!IS_NODE) {
            const el = getOpt(opt, "el") as any;
            const c = typeof el === "string" ? document.querySelector(el) : el instanceof HTMLElement ? el : null;
            if (c === null) {
                throw new Error(`Cannot find the container element.`);
            } else {
                this.container = c;
            }

            this.container.innerHTML = "";
        }

        this._data = opt.data || {};
        this._createDataProxy();

        this.components = opt.components || {};
        this.rendererType = opt.renderer || "svg";
        this.rendererOpt = opt.rendererOption || {};
        this.theme = opt.theme || "light";

        let size: { width: number; height: number };
        if (opt.template) {
            if (typeof opt.template !== "string") {
                throw Error(`Option "template" should be a string.`);
            }
            const { renderer, metadata, commands } = compile(
                getOpt(opt, "template"),
                getOpt(opt, "singleTemplate", false),
            );
            this.extCommands = commands;
            if (!metadata) {
                throw new Error(`The template must be wrapped with an svg or canvas block.`);
            }

            if (!this.rendererType) {
                this.rendererType = metadata.renderer as any;
            }

            size = {
                width: this._parseSize(metadata.width || "auto", true),
                height: this._parseSize(metadata.height || "auto", false),
            };

            const root = new RootComponent(0, renderer);
            root.setProp({
                ...getOpt(opt, "props", {}),
                width: GeometryValue.fullSize,
                height: GeometryValue.fullSize,
            });

            if (this._data) Object.keys(this._data).forEach(k => (root[k] = this._data[k]));
            this.setRootElement(root);
        } else if (opt.root) {
            opt.root.setProp(getOpt(opt, "props", {}));
            this.setRootElement(opt.root);

            size = {
                width: this._parseSize(getOpt(opt, "width", "auto").toString(), true),
                height: this._parseSize(getOpt(opt, "height", "auto").toString(), false),
            };
        } else {
            throw new Error(`Visualizer: Either "template" or "root" must be supplied.`);
        }

        this.size = new Proxy(size, {
            set: (obj, prop, value) => {
                if (typeof value === "string") {
                    value = this._parseSize(value, prop === "width");
                }
                obj[prop] = value;
                this._updateSize();
                return true;
            },
        });

        const renderer = renderers[this.rendererType];
        if (!renderer) {
            throw new Error(`Unknown renderer "${this.rendererType}"!`);
        }
        this.renderer = renderer;
        this.rendererCtx = {};
        this.renderer.init(this, this.rendererCtx);
    }

    public setRootElement(el: BaseElement) {
        this.root = el;
        this.root.isRoot = true;
        this.root.$v = this;
        this.root.$callHook("didCreate");
    }

    public get isCanavs() {
        return this.rendererType === "canvas";
    }

    public get isSVG() {
        return this.rendererType === "svg";
    }

    public run() {
        this.root.draw();
        this.firstRun = false;
        this.forceRedraw = false;
    }

    public transaction(callback: () => void) {
        if (this._isInTransaction) {
            this._queuedTransactions.push(callback);
            return;
        }
        this._isInTransaction = true;
        this._queuedTransactions.push(callback);
        let task;
        while ((task = this._queuedTransactions.shift())) {
            task.call(null);
        }
        this._isInTransaction = false;
        /*
        // check changed elements
        const toRemove: BaseElement[] = [];
        let p: BaseElement;
        for (const el of this._changedElements.values()) {
            p = el;
            while (p) {
                if (p !== el && this._changedElements.has(p)) {
                    toRemove.push(el);
                    break;
                }
                p = p.parent;
            }
        }
        toRemove.forEach(e => this._changedElements.delete(e));
        */
        // redraw
        if (this.isCanavs) {
            if (this._changedElements.size > 0) {
                for (const el of this._changedElements.values()) {
                    el.renderTree();
                }
                this.root.redraw();
            }
        } else {
            for (const el of this._changedElements.values()) {
                el.redraw();
            }
        }
        this._changedElements.clear();
    }

    public defineGradient(id: string, def: GradientDef): void;
    public defineGradient(id: string, direction: "horizontal" | "vertical" | number, stops: [string, string]): void;
    public defineGradient(id: string): void {
        let def: GradientDef;
        if (arguments.length === 2) {
            def = arguments[1];
        } else {
            def = { x1: 0, x2: 0, y1: 0, y2: 0, stops: [] };
            const direction = arguments[1];
            const stops = arguments[2] as [string, string];
            if (direction === "horizontal") {
                def.x2 = 100;
            } else if (direction === "vertical") {
                def.y2 = 100;
            } else if (typeof direction === "number") {
                let deg = direction;
                if (deg < 0) deg += 360;
                const values = {
                    "0": [0, 0, 100, 0],
                    "45": [0, 0, 100, 100],
                    "90": [0, 0, 0, 100],
                    "135": [100, 0, 0, 100],
                }[deg >= 180 ? deg - 180 : deg];
                if (!values) throw new Error(`defineGradient: direction should be a multiple of 45deg`);
                if (deg < 180) {
                    [def.x1, def.y1, def.x2, def.y2] = values;
                } else {
                    [def.x2, def.y2, def.x1, def.y1] = values;
                }
            } else {
                throw new Error(`defineGradient: direction should be a number or "horizontal" or "vertical"`);
            }
            def.stops = stops.map((s, i) => ({ offset: i * 100, color: s, opacity: 1 }));
        }
        this.renderer.defineGradient(id, def, this, this.rendererCtx);
    }

    private _parseSize(size: string, isWidth: boolean): number {
        if (size === "auto") {
            if (IS_NODE) {
                return 800;
            }
            const computedStyle = getComputedStyle(this.container!);

            return isWidth
                ? this.container!.clientWidth -
                      parseFloat(computedStyle.paddingTop!) -
                      parseFloat(computedStyle.paddingBottom!)
                : this.container!.clientHeight -
                      parseFloat(computedStyle.paddingLeft!) -
                      parseFloat(computedStyle.paddingRight!);
        } else {
            return parseFloat(size);
        }
    }

    private _updateSize() {
        this.renderer.setSize(this, this.rendererCtx);
    }
}

function getOpt<T extends keyof VisualizerOption>(
    opt: VisualizerOption,
    key: T,
    defaultValue?: NonNullable<VisualizerOption[T]>,
): NonNullable<VisualizerOption[T]> {
    if (key in opt) {
        return opt[key]!;
    } else {
        if (typeof defaultValue !== "undefined") {
            return defaultValue;
        }
        throw new Error(`Key "${key}" must present in visualizer options.`);
    }
}

export interface GradientDef {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
    stops: Array<{ offset: number; color: string; opacity?: number }>;
}

registerDefaultGlobalComponents();
