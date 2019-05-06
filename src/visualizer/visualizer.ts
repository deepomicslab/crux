import { GeometryValue } from "../defs/geometry";
import { BaseElement } from "../element/base-element";
import { Component } from "../element/component";
import { registerDefaultGlobalComponents } from "../element/global";
import { render } from "../rendering/svg";
import { compile } from "../template/compiler";

export interface VisualizerOption {
    el: string;
    template: string;
    props: Record<string, any>;
}

export class Visualizer {
    public container: Element;
    public root: BaseElement;
    public size: { width: number, height: number };

    constructor(opt: VisualizerOption) {
        this.container = document.querySelector(getOpt(opt, "el"));
        if (this.container === null) {
            throw new Error(`Cannot find the container element.`);
        }

        const [renderer, metadata] = compile(getOpt(opt, "template"));
        this.size = {
            width: this._parseSize(metadata.width, true),
            height: this._parseSize(metadata.height, false),
        };

        const root = new Component(0);
        root.render = renderer;
        root.prop = getOpt(opt, "props", {});
        root.prop.width = GeometryValue.fullSize;
        root.prop.height = GeometryValue.fullSize;
        this.setRootElement(root);
    }

    public setRootElement(el: BaseElement) {
        this.root = el;
        this.root.isRoot = true;
        this.root.$v = this;
    }

    public run() {
        this.root.renderTree();
        render(this.root);
    }

    private _parseSize(size: string, isWidth: boolean): number {
        if (size === "auto") {
            return isWidth ? this.container.clientWidth : this.container.clientHeight;
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
