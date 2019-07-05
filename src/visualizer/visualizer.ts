import { oneLineTrim } from "common-tags";
import { GeometryValue } from "../defs/geometry";
import { BaseElement } from "../element/base-element";
import { Component } from "../element/component";
import { registerDefaultGlobalComponents } from "../element/global";
import { RenderFunc } from "../rendering/base-renderer";
import { render as svgRenderFunc } from "../rendering/svg";
import { compile } from "../template/compiler";
import { RootComponent } from "./root";

export interface VisualizerOption {
    el: string;
    template?: string;
    props?: Record<string, any>;
    data?: Record<string, any>;
    root?: Component;
    components?: Record<string, any /*typeof Component*/>;
    renderer?: "canvas" | "svg";
    width?: number | "auto";
    height?: number | "auto";
    setup?: (this: Visualizer) => void;
}

export class Visualizer {
    public container: Element;
    public root!: BaseElement;
    private _data: Record<string, any>;
    public size!: { width: number, height: number };
    public components: Record<string, typeof Component>;

    public svgDef: Record<string, string> = {};

    public renderer: RenderFunc;

    private firstRun = true;

    public get data() { return this._data; }
    public set data(d) {
        this._data = d;
        Object.keys(this._data).forEach(k => this.root[k] = this._data[k]);
        if (!this.firstRun) this.run();
    }

    constructor(opt: VisualizerOption) {
        const el = getOpt(opt, "el") as any;
        const c = typeof el === "string" ? document.querySelector(el) :
            (el instanceof HTMLElement) ? el : null;
        if (c === null) {
            throw new Error(`Cannot find the container element.`);
        } else {
            this.container = c;
        }

        this.container.innerHTML = "";

        this._data = opt.data || {};
        this.components = opt.components || {};

        if (opt.template) {
            const [renderer, metadata] = compile(getOpt(opt, "template"));
            if (!metadata) {
                throw new Error(`The template must be wrapped with an svg or canvas block.`);
            }
            this.size = {
                width: this._parseSize(metadata.width || "auto", true),
                height: this._parseSize(metadata.height || "auto", false),
            };
            const root = new RootComponent(0, renderer);
            root.setProp({
                ...getOpt(opt, "props", {}),
                width: GeometryValue.fullSize,
                height: GeometryValue.fullSize,
            });
            if (this._data)
                Object.keys(this._data).forEach(k => root[k] = this._data[k]);
            this.setRootElement(root);
        } else if (opt.root) {
            opt.root.setProp(getOpt(opt, "props", {}));
            this.setRootElement(opt.root);
            this.size = {
                width: this._parseSize(getOpt(opt, "width", "auto").toString(), true),
                height: this._parseSize(getOpt(opt, "height", "auto").toString(), false),
            };
        }

        this.renderer = svgRenderFunc;
    }

    public setRootElement(el: BaseElement) {
        this.root = el;
        this.root.isRoot = true;
        this.root.$v = this;
        this.root.$callHook("didCreate");
    }

    public run() {
        this.root.draw();
        this.firstRun = false;
    }

    public appendDef(id: string, tag: string, attrs: Record<string, string> = {}, content: string = "") {
        const attrStr = Object.keys(attrs).map(k => `${k}=${attrs[k]}`).join(" ");
        this.svgDef[id] = `<${tag} id="${id}" ${attrStr}>${content}</${tag}>`;
    }

    public appendGradient(id: string, def: GradientDef): void;
    public appendGradient(id: string, direction: "horizontal" | "vertical", stops: [string, string]): void;
    public appendGradient(id: string): void {
        let def: GradientDef;
        if (arguments.length === 2) {
            def = arguments[1];
        } else {
            def = { x1: 0, x2: 0, y1: 0, y2: 0, stops: [] };
            const direction = arguments[1];
            const stops = arguments[2] as [string, string];
            if (direction === "horizontal") {
                def.x2 = 100;
            } else {
                def.y2 = 100;
            }
            def.stops = stops.map((s, i) => ({ offset: i * 100, color: s, opacity: 1 }));
        }
        this.appendDef(id, "linearGradient", {
            x1: `${def.x1}%`,
            x2: `${def.x2}%`,
            y1: `${def.y1}%`,
            y2: `${def.y2}%`,
        }, def.stops.map(s => oneLineTrim`
            <stop offset="${s.offset}%" style="
                stop-color:${s.color};
                stop-opacity:${s.opacity === undefined ? 1 : s.opacity}" />
            `).join());
    }

    private _parseSize(size: string, isWidth: boolean): number {
        if (size === "auto") {
            const computedStyle = getComputedStyle(this.container);

            return isWidth ?
                this.container.clientWidth - parseFloat(computedStyle.paddingTop!) - parseFloat(computedStyle.paddingBottom!) :
                this.container.clientHeight - parseFloat(computedStyle.paddingLeft!) - parseFloat(computedStyle.paddingRight!);
        } else {
            return parseFloat(size);
        }
    }
}

function getOpt<T extends keyof VisualizerOption>(
    opt: VisualizerOption, key: T, defaultValue?: NonNullable<VisualizerOption[T]>): NonNullable<VisualizerOption[T]> {
    if (key in opt) {
        return opt[key]!;
    } else {
        if (typeof defaultValue !== "undefined") { return defaultValue; }
        throw new Error(`Key "${key}" must present in visualizer options.`);
    }
}

export interface GradientDef {
    x1: number; x2: number; y1: number; y2: number;
    stops: Array<{ offset: number; color: string; opacity?: number }>;
}

registerDefaultGlobalComponents();
