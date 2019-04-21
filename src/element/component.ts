import { GeometryOptions } from "../defs/geometry";
import { RenderHelper } from "../rendering/render-helper";
import { ElementDef, updateTree } from "../rendering/render-tree";
import { render, SVGRenderable } from "../rendering/svg";
import { Renderer } from "../template/compiler";
import { applyMixins } from "../utils/mixin";
import { BaseElement } from "./base-element";
import { BaseOption } from "./base-options";
import { ComponentOption } from "./component-options";
import { ScaleHelper } from "./scale";

export type ActualElement = BaseElement<BaseOption>;

export class Component<Option extends ComponentOption = ComponentOption>
    extends BaseElement<Option>
    implements SVGRenderable, RenderHelper, ScaleHelper {

    public children: ActualElement[] = [];
    public tree: ElementDef;

    private $scaleX: (val: number) => number;
    private $scaleY: (val: number) => number;

    constructor(uid: number, renderer?: Renderer) {
        super(uid);
        if (renderer) {
            this.render = renderer;
        }
    }

    protected _setProp(key: string, value: any) {
        if (key === "xScale") {
            this.$scaleX = value;
        } else if (key === "yScale") {
            this.$scaleY = value;
        }
        super._setProp(key, value);
    }

    public append(node: ActualElement) {
        this.children.push(node);
        node.parent = this as any;
    }

    public render: () => ElementDef;

    public renderTree() {
        updateTree(this as any);
    }

    public getScale(horizontal: boolean): any {
        return (horizontal ? this.$scaleX : this.$scaleY) ||
            (this.parent ? this.parent.getScale(horizontal) : null);
    }

    public svgTagName() { return "g"; }
    public svgTextContent() { return null; }
    public svgAttrs(): Record<string, string|number|boolean> {
        const $g = this.$geometry as any;
        return {
            transform: `translate(${$g.x},${$g.y})`,
        };
    }

    public static geometryProps() {
        const { h, v } = super.geometryProps();
        return {
            h: [...h, "width"],
            v: [...v, "height"],
        };
    }

    public get maxX(): number {
        return (this.$geometry as any).x + (this.$geometry as any).width;
    }

    public get maxY(): number {
        return (this.$geometry as any).y + (this.$geometry as any).height;
    }

    public _c: () => ElementDef;
    public _l: () => ElementDef[];
    public scaleLinear: (domain: [number, number], range?: [number, number]) => d3.ScaleLinear<number, number>
}

applyMixins(Component, [RenderHelper, ScaleHelper]);
