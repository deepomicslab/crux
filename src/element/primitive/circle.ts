import { getThemeColor } from "../../color";
import { GeometryOptValue } from "../../defs/geometry";
import { getFinalPosition } from "../../layout/layout";
import { canvasFill, canvasStroke } from "../../rendering/canvas/canvas-helper";
import { svgPropFillAndStroke } from "../../rendering/svg/svg-helper";
import { BaseElementOption } from "./base-elm-options";
import { PrimitiveElement } from "./primitive";

interface CircleOption extends BaseElementOption {
    r: GeometryOptValue;
}

export class Circle extends PrimitiveElement<CircleOption> {
    public svgAttrs(): any {
        const [x, y] = getFinalPosition(this);
        const r = this.$geometry.r;
        return {
            ...svgPropFillAndStroke(this),
            cx: x + r,
            cy: y + r,
            r,
        };
    }

    public svgTagName() {
        return "circle";
    }
    public svgTextContent() {
        return null;
    }

    public renderToCanvas(ctx: CanvasRenderingContext2D) {
        const [x, y] = getFinalPosition(this);
        const r = this.$geometry.r;
        this.path = new Path2D();
        this.path.arc(x + r, y + r, r, 0, 2 * Math.PI, false);
        canvasFill(ctx, this);
        canvasStroke(ctx, this);
    }

    public geometryProps() {
        const { h, v } = super.geometryProps();
        return { h, v: [...v, "r"] };
    }

    public defaultProp() {
        return {
            r: 5,
            fill: getThemeColor(this.$v.theme, "theme"),
        };
    }

    public get maxX() {
        return this.$geometry._x + this.$geometry.r * 2;
    }

    public get maxY() {
        return this.$geometry._y + this.$geometry.r * 2;
    }

    public get layoutWidth() {
        return this.$geometry.r * 2;
    }
    public get layoutHeight() {
        return this.$geometry.r * 2;
    }
}
