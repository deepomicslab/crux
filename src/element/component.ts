import { GeometryValue } from "../defs/geometry";
import { RenderHelper } from "../rendering/render-helper";
import { ElementDef, updateTree } from "../rendering/render-tree";
import { SVGRenderable } from "../rendering/svg";
import { svgPropClip } from "../rendering/svg-helper";
import { Renderer } from "../template/compiler";
import { applyMixins } from "../utils/mixin";
import { BaseElement } from "./base-element";
import { BaseOption } from "./base-options";
import { ComponentOption } from "./component-options";
import { isRenderable } from "./is";
import { ScaleHelper } from "./scale";

export type ActualElement = BaseElement<BaseOption>;

type Scale = d3.ScaleContinuousNumeric<number, number>;

export class Component<Option extends ComponentOption = ComponentOption>
    extends BaseElement<Option>
    implements SVGRenderable, RenderHelper, ScaleHelper {

    public $ref: Record<string, ActualElement> = {};
    public children: ActualElement[] = [];
    public tree: ElementDef;

    public $scaleX: Scale;
    public $scaleY: Scale;

    constructor(id: number, renderer?: Renderer) {
        super(id);
        if (renderer) {
            this.render = renderer;
        }
    }

    public defaultProp() {
        return {
            width: GeometryValue.fullSize,
        } as any;
    }

    public parseInternalProps() {
        super.parseInternalProps();
        if ("xScale" in this.prop) this._setScale(true);
        if ("yScale" in this.prop) this._setScale(false);
    }

    private _setScale(horizontal: boolean) {
        const s = horizontal ? this.prop.xScale : this.prop.yScale;
        if (typeof s === "object" && s.__scale__) {
            const k = horizontal ? "$scaleX" : "$scaleY";
            if (this[k] && s.type === "linear") {
                if (s.domain) (this[k] as Scale).domain(s.domain);
                if (s.range) (this[k] as Scale).range(s.range);
            } else {
                this[k] = this._createScale_linear(horizontal, s.domain, s.range);
            }
        }
    }

    public append(node: ActualElement) {
        this.children.push(node);
        node.$v = this.$v;
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
        let v: any;
        const $g = this.$geometry as any;
        let transform = `translate(${$g.x},${$g.y})`;
        if (v = this.prop.rotation)
            transform = `rotate(${v[0]},${v[1]},${v[2]}) ${transform}`;
        return {
            ...svgPropClip(this as any),
            transform,
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

    protected _updateGeometry(key: "width" | "height", value: number) {
        let c: BaseElement = this as any;
        while (true) {
            c.$geometry[key] = value;
            if (isRenderable(c)) {
                c = c.children[0];
            } else break;
        }
    }

    protected _scale(val: number, horizontal: boolean): number {
        const scale = this.getScale(horizontal);
        return typeof scale === "function" ? scale(val) : val;
    }

    public _c: () => ElementDef;
    public _l: () => ElementDef[];
    // tslint:disable-next-line: variable-name
    public _createScale_linear: (horizontal: boolean, domain: [number, number], range?: [number, number]) => d3.ScaleLinear<number, number>;
}

applyMixins(Component, [RenderHelper, ScaleHelper]);
