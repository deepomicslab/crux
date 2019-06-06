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
    components?: Record<string, typeof Component>;
    renderer?: "canvas" | "svg";
    width?: number | "auto";
    height?: number | "auto";
}

export class Visualizer {
    public container: Element;
    public root: BaseElement;
    private _data: Record<string, any>;
    public size: { width: number, height: number };
    public components: Record<string, typeof Component>;

    public svgDef: Record<string, string> = {};

    public renderer: RenderFunc;

    public get data() { return this._data; }
    public set data(d) {
        this._data = d;
        this.run();
    }

    constructor(opt: VisualizerOption) {
        const el = getOpt(opt, "el") as any;
        this.container = typeof el === "string" ? document.querySelector(el) :
            (el instanceof HTMLElement) ? el : null;
        if (this.container === null) {
            throw new Error(`Cannot find the container element.`);
        }

        this.container.innerHTML = "";

        this._data = opt.data;
        this.components = opt.components;

        if (opt.template) {
            const [renderer, metadata] = compile(getOpt(opt, "template"));
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
    }

    public appendDef(id: string, tag: string, attrs: Record<string, string> = {}, content: string = "") {
        const attrStr = Object.keys(attrs).map(k => `${k}=${attrs[k]}`).join(" ");
        this.svgDef[id] = `<${tag} id="${id}" ${attrStr}>${content}</${tag}>`;
    }

    private _parseSize(size: string, isWidth: boolean): number {
        if (size === "auto") {
            const computedStyle = getComputedStyle(this.container);

            return isWidth ?
                this.container.clientWidth - parseFloat(computedStyle.paddingTop) - parseFloat(computedStyle.paddingBottom) :
                this.container.clientHeight - parseFloat(computedStyle.paddingLeft) - parseFloat(computedStyle.paddingRight);
        } else {
            return parseFloat(size);
        }
    }
}

function getOpt<T extends keyof VisualizerOption>(
    opt: VisualizerOption, key: T, defaultValue?: VisualizerOption[T]): VisualizerOption[T] {
    if (key in opt) {
        return opt[key];
    } else {
        if (typeof defaultValue !== "undefined") { return defaultValue; }
        throw new Error(`Key "${key}" must present in visualizer options.`);
    }
}

registerDefaultGlobalComponents();
