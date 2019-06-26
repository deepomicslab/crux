import { GeometryOptions, GeometryValue } from "../defs/geometry";
import { getFinalPosition } from "../layout/layout";
import helperMixin from "../rendering/helper-mixin";
import { RenderMixin } from "../rendering/render-mixin";
import { ElementDef, updateTree } from "../rendering/render-tree";
import { SVGRenderable } from "../rendering/svg";
import { svgPropClip } from "../rendering/svg-helper";
import { Renderer } from "../template/compiler";
import { applyMixins } from "../utils/mixin";
import { BaseElement } from "./base-element";
import { BaseOption } from "./base-options";
import { ComponentOption } from "./component-options";
import { isRenderable } from "./is";
import { ScaleMixin } from "./scale";

export type ActualElement = BaseElement<BaseOption>;

type Scale = d3.ScaleContinuousNumeric<number, number>;

interface PolarCoordInfo {
    r: number;
    cx: number;
    cy: number;
}

export class Component<Option extends ComponentOption = ComponentOption>
    extends BaseElement<Option>
    implements SVGRenderable, RenderMixin, ScaleMixin {

    public static components: Record<string, typeof Component>;

    public $ref: Record<string, ActualElement> = {};
    public children: ActualElement[] = [];
    public tree?: ElementDef;

    public $scaleX?: Scale | null;
    public $scaleY?: Scale | null;

    public $isCoordRoot: boolean = false;
    public $polar?: PolarCoordInfo;

    public _inheritedWidth?: boolean;
    public _inheritedHeight?: boolean;
    public _defaultedWidth?: boolean;
    public _defaultedHeight?: boolean;

    constructor(id: number, renderer?: Renderer) {
        super(id);
        if (renderer) {
            this.render = renderer;
        }
    }

    public defaultProp() {
        return {
            x: 0,
            y: 0,
            width: GeometryValue.fullSize,
        } as any;
    }

    public setProp(prop: Partial<Option>) {
        if (!("width" in prop))
            this._defaultedWidth = true;
        if (!("height" in prop))
            this._defaultedHeight = true;
        super.setProp(prop);
    }

    public parseInternalProps() {
        super.parseInternalProps();
        if ("xScale" in this.prop) this._setScale(true);
        if ("yScale" in this.prop) this._setScale(false);
    }

    private _setScale(horizontal: boolean) {
        const s = horizontal ? this.prop.xScale : this.prop.yScale;
        const k = horizontal ? "$scaleX" : "$scaleY";
        if (s === null) {
            this[k] = null;
        } else if (typeof s === "object" && s.__scale__) {
            if (this[k] && s.type === "linear") {
                if (s.domain) (this[k] as Scale).domain(s.domain);
                if (s.range) (this[k] as Scale).range(s.range);
            } else {
                this[k] = this._createScaleLinear(horizontal, s.domain, s.range);
            }
        } else if (typeof s === "function") {
            this[k] = s as any;
        }
    }

    public append(node: ActualElement) {
        this.children.push(node);
        node.$v = this.$v;
        node.parent = this as any;
    }

    public render?: () => ElementDef;

    public renderTree() {
        updateTree(this as any);
    }

    public svgTagName() { return "g"; }
    public svgTextContent() { return null; }
    public svgAttrs(): Record<string, string|number|boolean> {
        const attrs = svgPropClip(this as any);
        let v: any;
        let transform: string;
        let x = 0, y = 0;
        if (this.$coord && this.$coord.$polar && !this.$isCoordRoot) {
            transform = "";
        } else {
            [x, y] = getFinalPosition(this as any);
            transform = x === 0 && y === 0 ? "" : `translate(${x},${y})`;
        }
        if (v = this.prop.rotation) {
            if (typeof v === "number")
                transform = `rotate(${v}) ${transform}`;
            else if (Array.isArray(v))
                transform = `rotate(${v[0]},${v[1] === "_" ? x : v[1]},${v[2] === "_" ? y : v[2]}) ${transform}`;
            else
                throw new Error(`transform value must be a number or an array.`);
        }
        if (transform) {
            attrs.transform = transform;
        }
        return attrs;
    }

    // geometry

    public __didLayout() {
        if (this.prop.coord === "polar" && !this.inPolorCoordSystem) {
            const $g = this.$geometry as unknown as GeometryOptions<ComponentOption>;
            const r = Math.min($g.width, $g.height) * 0.5;
            const cx = $g.width * 0.5;
            const cy = $g.height * 0.5;
            this.$polar = { r, cx, cy };
            this.$geometry._xOffset.polor = cx;
            this.$geometry._yOffset.polor = cy;
        }
    }

    public getScale(horizontal: boolean): any {
        return (horizontal ? this.$scaleX : this.$scaleY) ||
            (this.parent ? this.parent.getScale(horizontal) : null);
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

    protected get widthIsNotDefined() {
        return !this.prop.width || (this._inheritedWidth && this.parent._defaultedWidth);
    }

    protected get heightIsNotDefined() {
        return !this.prop.height || (this._inheritedHeight && this.parent._defaultedHeight);
    }

    // hooks
    public willInsertChildren?(children: ElementDef[]): void;

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

    public _c!: () => ElementDef;
    public _l!: () => ElementDef[];
    public _h = helperMixin;

    public _createScaleLinear!: (horizontal: boolean, domain: [number, number], range?: [number, number]) => d3.ScaleLinear<number, number>;
    public _createScaleOrdinal!: (domain: string[], range: number[]) => d3.ScaleOrdinal<string, number>;
}

applyMixins(Component, [RenderMixin, ScaleMixin]);
