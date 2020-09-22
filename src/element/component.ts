import { GeometryOptions, GeometryValue } from "../defs/geometry";
import { getFinalPosition } from "../layout/layout";
import { canvasClip } from "../rendering/canvas/canvas-helper";
import { ElementDef } from "../rendering/element-def";
import helperMixin from "../rendering/helper-mixin";
import RenderMixin from "../rendering/render-mixin";
import { updateTree } from "../rendering/render-tree";
import { svgPropClip } from "../rendering/svg/svg-helper";
import { compile, Renderer } from "../template/compiler";
import { toRad } from "../utils/math";
import { applyMixins } from "../utils/mixin";
import { BaseElement } from "./base-element";
import { BaseOption } from "./base-options";
import { ComponentOption } from "./component-options";
import { isRenderable } from "./is";
import { scaled, ScaleMixin, shift1 } from "./scale";

export type ActualElement = BaseElement<BaseOption>;

type Scale = d3.ScaleContinuousNumeric<number, number> & { __type__?: string };

export interface PolarCoordInfo {
    r: number;
    cx: number;
    cy: number;
    rad: boolean;
}

export class Component<Option extends ComponentOption = ComponentOption>
    extends BaseElement<Option>
    implements RenderMixin, ScaleMixin {
    public static components: Record<string, any>;

    public $ref: Record<string, ActualElement | ActualElement[]> = {};
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

    public $_extraTransforms: [string, ...number[]][] = [];
    public $_cachedTransform?: [number, number, number, number, number];

    private _childMap = new Map<string, ActualElement>();

    constructor(id: number | string = 0, renderer?: Renderer) {
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
        if (!("width" in prop)) this._defaultedWidth = true;
        if (!("height" in prop)) this._defaultedHeight = true;
        super.setProp(prop);
    }

    public append(node: ActualElement) {
        this.children.push(node);
        this._childMap.set(`${node.id}@@${node._name}`, node);
        node.$v = this.$v;
        node.parent = this as any;
    }

    public findChild(id: string | number, type: string) {
        return this._childMap.get(`${id}@@${type}`);
    }

    public render?(): ElementDef;

    public renderTree() {
        updateTree(this as any);
    }

    protected _getTransformation(): [number, number, number, number, number] {
        let v: any;
        let x = 0,
            y = 0;
        if (!(this.$coord && this.$coord.$polar && !this.$isCoordRoot)) {
            [x, y] = getFinalPosition(this as any);
        }
        if ((v = this.prop.rotation)) {
            if (typeof v === "number") return [x, y, v, 0, 0];
            else if (Array.isArray(v)) return [x, y, v[0], v[1] === "_" ? x : v[1], v[2] === "_" ? y : v[2]];
            else throw new Error(`transform value must be a number or an array.`);
        }
        return [x, y, 0, 0, 0];
    }

    public get isStatic() {
        if (this.$v.forceRedraw) return false;
        if (typeof this.prop.static === "function") {
            return this.prop.static();
        }
        return this.prop.static;
    }

    // svg

    public svgTagName() {
        return "g";
    }
    public svgTextContent() {
        return null;
    }
    public svgAttrs(): Record<string, string | number | boolean> {
        const attrs = svgPropClip(this as any);
        const [x, y, rc, rx, ry] = this._getTransformation();
        const rotateAfterTranslate = this.prop.rotateAfterTranslate;
        let transform = x === 0 && y === 0 ? "" : `translate(${x},${y})`;
        const hasExtraTransform = this.$_extraTransforms.length;
        if (rc !== 0) {
            if (rx === 0 && ry === 0) {
                transform = rotateAfterTranslate ? `${transform} rotate(${rc})` : `rotate(${rc}) ${transform}`;
            } else {
                transform = rotateAfterTranslate
                    ? `${transform} rotate(${rc},${rx},${ry})`
                    : `rotate(${rc},${rx},${ry}) ${transform}`;
            }
        }
        if (transform || hasExtraTransform) {
            attrs.transform = transform;
            attrs.transform += this.$_extraTransforms.reduce(
                (p, [name, ...args]) => `${p} ${name}(${args.join(",")})`,
                "",
            );
        }
        if ("opacity" in this.prop) {
            attrs.opacity = this.prop.opacity;
        }
        if ("events" in this.prop) {
            attrs["pointer-events"] = this.prop.events;
        }
        return attrs;
    }

    // canvas
    public renderToCanvas(ctx: CanvasRenderingContext2D) {
        const t = (this.$_cachedTransform = this._getTransformation());
        const [x, y, rc, rx, ry] = t;
        if (this.$_extraTransforms.length) {
            for (const [name, ...args] of this.$_extraTransforms) {
                if (name === "scale") ctx.scale(args[0], args[0]);
                else if (name === "translate") ctx.translate.apply(ctx, args as [number, number]);
                else if (name === "rotate") ctx.rotate(args[0]);
            }
        } else {
            const rotateAfterTranslate = this.prop.rotateAfterTranslate;
            const needTranslate = x !== 0 || y !== 0;
            if (rotateAfterTranslate && needTranslate) {
                ctx.translate(x, y);
            }
            if (rc !== 0) {
                if (rx === 0 && ry === 0) {
                    ctx.rotate(toRad(rc));
                } else {
                    ctx.translate(rx, ry);
                    ctx.rotate(toRad(rc));
                    ctx.translate(-rx, -ry);
                }
            }
            if (!rotateAfterTranslate && needTranslate) {
                ctx.translate(x, y);
            }
        }
        canvasClip(ctx, this as any);
    }

    // geometry

    public __didLayout() {
        if ("xScale" in this.prop) this._initScale(true);
        if ("yScale" in this.prop) this._initScale(false);

        if (this.prop.coord === "polar" && !this.inPolorCoordSystem) {
            const $g = (this.$geometry as unknown) as GeometryOptions<ComponentOption>;
            const r = Math.min($g.width, $g.height) * 0.5;
            const cx = $g.width * 0.5;
            const cy = $g.height * 0.5;
            this.$polar = { r, cx, cy, rad: !!this.prop.coordUseRad };
            this.$geometry._xOffset.polor = cx;
            this.$geometry._yOffset.polor = cy;
        } else if (this.$polar) {
            this.$polar = undefined;
            delete this.$geometry._xOffset.polor;
            delete this.$geometry._yOffset.polor;
        }
    }

    private _initScale(horizontal: boolean) {
        const s = horizontal ? this.prop.xScale : this.prop.yScale;
        const k = horizontal ? "$scaleX" : "$scaleY";
        if (s === null) {
            this[k] = null;
        } else if (typeof s === "object" && s.__scale__) {
            if (this[k] && s.type === this[k]!.__type__) {
                const scale = this[k] as Scale;
                const domain = s.domain === null ? [0, 1] : s.domain;
                scale.domain(s.type === "log" ? shift1(domain) : domain);
                scale.range(s.range === null ? this.boundaryForScale(horizontal) : s.range);
            } else {
                this[k] = this._createScale(s.type, horizontal, s.domain, s.range);
            }
        } else if (typeof s === "function") {
            this[k] = s as any;
        }
    }

    public getScale(horizontal: boolean): any {
        return (horizontal ? this.$scaleX : this.$scaleY) || (this.parent ? this.parent.getScale(horizontal) : null);
    }

    public geometryProps() {
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

    public boundaryForScale(horizontal?: boolean): [number, number] {
        const size = horizontal
            ? this.$polar
                ? this.$polar.rad
                    ? Math.PI * 2
                    : 360
                : (this.$geometry as any).width
            : this.$polar
            ? this.$polar.r
            : (this.$geometry as any).height;
        return [0, size];
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
        if (this.$parent) {
            if (horizontal) this.$parent.isInXScaleSystem = true;
            else this.$parent.isInYScaleSystem = true;
        }
        if (horizontal) this.isInXScaleSystem = true;
        else this.isInYScaleSystem = true;
        const scale = this.getScale(horizontal);
        return typeof scale === "function" ? scaled(scale, val) : val;
    }

    // placeholders for mixins

    public _z!: () => ElementDef;
    public _c!: () => ElementDef;
    public _i!: () => Function;
    public _y!: () => ElementDef;
    public _l!: () => ElementDef[];
    public _h = helperMixin;

    public _createScale!: (
        type: "linear" | "log",
        horizontal: boolean,
        domain: [number, number],
        range?: [number, number],
    ) => d3.ScaleLinear<number, number>;
    public _createScaleOrdinal!: (domain: string[], range: number[]) => d3.ScaleOrdinal<string, number>;

    protected t!: (t: TemplateStringsArray, ...placeholders: string[]) => ElementDef;
}

const kCachedrenderFunc = Symbol("CachedRenderFunction");

class TemplateMixin {
    // @ts-ignore
    private t(t: TemplateStringsArray, ...placeholders: string[]): ElementDef {
        let template = "";
        for (let i = 0; i < placeholders.length; i++) {
            template += t[i];
            template += placeholders[i];
        }
        template += t[t.length - 1];

        const p = this.constructor.prototype;
        const cached = p[kCachedrenderFunc];
        if (cached) {
            return cached.call(this);
        }
        const renderFunc = compile(template).renderer;
        p[kCachedrenderFunc] = renderFunc;
        return renderFunc.call(this as any);
    }
}

applyMixins(Component, [RenderMixin, ScaleMixin, TemplateMixin]);
