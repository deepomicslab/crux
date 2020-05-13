import { getThemeColor } from "../../color";
import { canvasFill, canvasStroke } from "../../rendering/canvas/canvas-helper";
import { svgPropFillAndStroke, svgPropPassthrough } from "../../rendering/svg/svg-helper";
import { BaseElementOption } from "./base-elm-options";
import { PrimitiveElement } from "./primitive";

export interface PolylineOption extends BaseElementOption {
    points: [number, number][];
}

export class Polyline extends PrimitiveElement<PolylineOption> {
    public svgAttrs(): any {
        let pointsStr = ``;
        for (const p of this.prop.points) {
            const [x, y] = this.translatePoint(p[0], p[1]);
            pointsStr += `${x},${y} `;
        }
        return {
            ...svgPropFillAndStroke(this),
            ...svgPropPassthrough({
                "shape-rendering": "shapeRendering",
            })(this),
            points: pointsStr,
        };
    }

    public svgTagName() {
        return "polyline";
    }
    public svgTextContent() {
        return null;
    }

    public renderToCanvas(ctx: CanvasRenderingContext2D) {
        this.path = new Path2D();
        this.prop.points.forEach((p, i) => {
            const [x, y] = this.translatePoint(p[0], p[1]);
            if (i === 0) {
                this.path!.moveTo(x, y);
            } else {
                this.path!.lineTo(x, y);
            }
        });
        canvasFill(ctx, this);
        canvasStroke(ctx, this);
    }

    public defaultProp() {
        return {
            stroke: getThemeColor(this.$v.theme, "line"),
            fill: "none",
        };
    }

    public positionDetached = true;
}
