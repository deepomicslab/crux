import { getThemeColor } from "../../color";
import { GeometryOptValue } from "../../defs/geometry";
import { getFinalPosition } from "../../layout/layout";
import { canvasFill, canvasRotate, canvasStroke } from "../../rendering/canvas/canvas-helper";
import { svgPropFillAndStroke, svgRotation } from "../../rendering/svg/svg-helper";
import { BaseElementOption } from "./base-elm-options";
import { PrimitiveElement } from "./primitive";

export interface TriangleOption extends BaseElementOption {
    orientation: "top" | "right" | "bottom" | "left";
    height: GeometryOptValue;
    width: GeometryOptValue;
}

export class Triangle extends PrimitiveElement<TriangleOption> {
    public static propNameForInitializer(): string {
        return "d";
    }

    public geometryProps() {
        const { h, v } = super.geometryProps();
        return {
            h: [...h, "width"],
            v: [...v, "height"],
        };
    }

    public get maxX(): number {
        return this.$geometry.x + this.$geometry.width;
    }

    public get maxY(): number {
        return this.$geometry.y + this.$geometry.height;
    }

    public svgAttrs(): any {
        const p = this.getPoints();
        const result = {
            ...svgPropFillAndStroke(this),
            ...svgRotation(this),
            d: `M${p[0][0]},${p[0][1]} L${p[1][0]},${p[1][1]} L${p[2][0]},${p[2][1]} z`,
        };
        if (this.$geometry._x !== 0 || this.$geometry._y !== 0) {
            if (!result.transform) result.transform = "";
            result.transform += `translate(${this.$geometry._x},${this.$geometry._y})`;
        }
        return result;
    }

    public svgTagName() {
        return "path";
    }
    public svgTextContent() {
        return null;
    }

    public renderToCanvas(ctx: CanvasRenderingContext2D) {
        canvasRotate(ctx, this);
        const [x, y] = getFinalPosition(this);
        ctx.translate(x, y);

        const p = this.getPoints();
        ctx.moveTo(p[0][0], p[0][1]);
        ctx.lineTo(p[1][0], p[1][1]);
        ctx.lineTo(p[2][0], p[2][1]);
        ctx.closePath();

        canvasFill(ctx, this);
        canvasStroke(ctx, this);
    }

    private getPoints() {
        const { width, height } = this.$geometry;
        switch (this.prop.orientation) {
            case "bottom":
                return [
                    [0, 0],
                    [width, 0],
                    [width / 2, height],
                ];
            case "left":
                return [
                    [0, height / 2],
                    [width, 0],
                    [width, height],
                ];
            case "right":
                return [
                    [0, 0],
                    [width, height / 2],
                    [0, height],
                ];
            default:
                return [
                    [width / 2, 0],
                    [width, height],
                    [0, height],
                ];
        }
    }

    public defaultProp(): Partial<TriangleOption> {
        return {
            height: 8,
            width: 8,
            orientation: "top",
            fill: getThemeColor(this.$v.theme, "theme"),
        };
    }
}
