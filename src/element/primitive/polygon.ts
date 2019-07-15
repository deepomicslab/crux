import { canvasFill, canvasStroke } from "../../rendering/canvas-helper";
import { svgPropFillAndStroke, svgPropPassthrough } from "../../rendering/svg-helper";
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
            ...svgPropFillAndStroke(this),
            ...svgPropPassthrough({
                "shape-rendering": "shapeRendering",
            })(this),
            points: pointsStr,
        };
    }

    public svgTagName() {return "polygon"; }
    public svgTextContent() { return null; }

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
        this.path.closePath();
        canvasFill(ctx, this);
        canvasStroke(ctx, this);
    }

    public defaultProp() {
        return {
            stroke: "#000",
            fill: "none",
        };
    }

    public positionDetached = true;
}
