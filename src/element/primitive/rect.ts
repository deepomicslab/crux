import { getThemeColor } from "../../color";
import { GeometryOptValue } from "../../defs/geometry";
import { getFinalPosition } from "../../layout/layout";
import { canvasFill, canvasStroke } from "../../rendering/canvas-helper";
import { svgPropFillAndStroke, svgPropPassthrough } from "../../rendering/svg-helper";
import { BaseElementOption } from "./base-elm-options";
import { PrimitiveElement } from "./primitive";

interface RectOption extends BaseElementOption {
    width: GeometryOptValue;
    height: GeometryOptValue;
    xEnd: GeometryOptValue;
    yEnd: GeometryOptValue;
    minWidth: number;
    minHeight: number;
    cornerRadius: number;
}

export class Rect extends PrimitiveElement<RectOption> {

    public svgAttrs(): any {
        let [x, y] = getFinalPosition(this as any);
        let width = this._widthWithMin(x);
        let height = this._heightWithMin(y);
        if (width < 0) {
            x += width;
            width = -width;
        }
        if (height < 0) {
            y -= height;
            height = -height;
        }
        return {
            ...svgPropFillAndStroke(this),
            ...svgPropPassthrough({
                rx: "cornerRadius",
                ry: "cornerRadius",
            })(this),
            x, y,
            width,
            height,
        };
    }

    public svgTagName() { return "rect"; }
    public svgTextContent() { return null; }

    public renderToCanvas(ctx: CanvasRenderingContext2D) {
        const [x, y] = getFinalPosition(this as any);
        const w = this._widthWithMin(x);
        const h = this._heightWithMin(y);
        this.path = new Path2D();
        if (this.prop.cornerRadius) {
            let r = this.prop.cornerRadius as number;
            if (w < 2 * r) r = w / 2;
            if (h < 2 * r) r = h / 2;
            this.path.moveTo(x + r, y);
            this.path.arcTo(x + w, y, x + w, y + h, r);
            this.path.arcTo(x + w, y + h, x, y + h, r);
            this.path.arcTo(x, y + h, x, y, r);
            this.path.arcTo(x, y, x + w, y, r);
            this.path.closePath();
        } else {
            this.path.rect(x, y, w, h);
        }
        canvasFill(ctx, this);
        canvasStroke(ctx, this);
    }

    public static geometryProps() {
        const { h, v } = super.geometryProps();
        return {
            h: [...h, "width", "xEnd"],
            v: [...v, "height", "yEnd"],
        };
    }

    public defaultProp() {
        return {
            fill: getThemeColor(this.$v.theme, "theme"),
        };
    }

    public get maxX(): number {
        return this.$geometry.x + this.$geometry.width;
    }

    public get maxY(): number {
        return this.$geometry.y + this.$geometry.height;
    }

    private _widthWithMin(x: number): number {
        const gw = this.$geometry.width;
        const gx2 = this.$geometry.xEnd;
        if (gw === null && gx2 === null)
            throw new Error(`Rect: width not defined`);
        const width = gw === null ? gx2 - x : gw;
        return "minWidth" in this.prop && this.prop.minWidth > 0 ?
            Math.max(width, this.prop.minWidth) : width;
    }

    private _heightWithMin(y: number): number {
        const gh = this.$geometry.height;
        const gy2 = this.$geometry.yEnd;
        if (gh === null && gy2 === null)
            throw new Error(`Rect: height not defined`);
        const height = gh === null ? gy2 - y : gh;
        return "minHeight" in this.prop && this.prop.minWidth > 0 ?
            Math.max(height, this.prop.minHeight) : height;
    }
}
