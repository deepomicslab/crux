import { getThemeColor } from "../../color";
import { canvasFill, canvasRotate, canvasStroke } from "../../rendering/canvas/canvas-helper";
import { svgPropFillAndStroke, svgPropPassthrough, svgRotation } from "../../rendering/svg/svg-helper";
import { BaseElementOption } from "./base-elm-options";
import { PrimitiveElement } from "./primitive";

export interface PolygonOption extends BaseElementOption {
    points: [number, number][];
}

export class Polygon extends PrimitiveElement<PolygonOption> {
    public svgAttrs(): any {
        let pointsStr = ``;
        for (const p of this.prop.points) {
            const [x, y] = this.translatePoint(p[0], p[1]);
            pointsStr += `${x},${y} `;
        }
        return {
            ...svgRotation(this),
            ...svgPropFillAndStroke(this),
            ...svgPropPassthrough({
                "shape-rendering": "shapeRendering",
            })(this),
            points: pointsStr,
        };
    }

    public svgTagName() {
        return "polygon";
    }
    public svgTextContent() {
        return null;
    }

    public renderToCanvas(ctx: CanvasRenderingContext2D) {
        canvasRotate(ctx, this);
        this.path = new Path2D();
        this.prop.points.forEach((p, i) => {
            const [x, y] = this.translatePoint(p[0], p[1]);
            if (i === 0) {
                this.path!.moveTo(x, y);
            } else {
                this.path!.lineTo(x, y);
            }
        });
        this.path.closePath();
        canvasFill(ctx, this);
        canvasStroke(ctx, this);
    }

    public defaultProp() {
        return {
            stroke: "none",
            fill: getThemeColor(this.$v.theme, "theme"),
        };
    }

    public positionDetached = true;
}
