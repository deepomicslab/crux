import { getThemeColor } from "../../color";
import { getFinalPosition } from "../../layout/layout";
import { canvasFill, canvasStroke } from "../../rendering/canvas-helper";
import { svgPropFillAndStroke, svgRotation } from "../../rendering/svg-helper";
import { BaseElementOption } from "./base-elm-options";
import { PrimitiveElement } from "./primitive";

export interface TriangleOption extends BaseElementOption {
    orientation: "top" | "right" | "bottom" | "left";
    length: number;
    width: number;
}

export class Triangle extends PrimitiveElement<TriangleOption> {
    public static propNameForInitializer(): string { return "d"; }

    public svgAttrs(): any {
        const p = this.getPoints();
        const result = {
            ...svgPropFillAndStroke(this),
            ...svgRotation(this),
            d: `M${p[0][0]},${p[0][1]} L${p[1][0]},${p[1][1]} L${p[2][0]},${p[2][1]} z`,
        };
        if (this.$geometry.x !== 0 || this.$geometry.y !== 0) {
            if (!result.transform) result.transform = "";
            result.transform += `translate(${this.$geometry.x},${this.$geometry.y})`;
        }
        return result;
    }

    public svgTagName() { return "path"; }
    public svgTextContent() { return null; }

    public renderToCanvas(ctx: CanvasRenderingContext2D) {
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
        const { width, length } = this.prop;
        const p = [[-width, width], [0, width - length], [width, width]];
        switch (this.prop.orientation) {
            case "bottom":
                return p.map(([x, y]) => [x, -y]);
            case "left":
                return p.map(([x, y]) => [y, x]);
            case "right":
                return p.map(([x, y]) => [y, x]);
            default:
                return p;
        }
    }

    public defaultProp(): Partial<TriangleOption> {
        return {
            length: 8,
            width: 4,
            orientation: "top",
            fill: getThemeColor(this.$v.theme, "theme"),
        };
    }
}
