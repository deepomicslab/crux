import { getThemeColor } from "../../color";
import { GeometryOptValue } from "../../defs/geometry";
import { canvasStroke } from "../../rendering/canvas/canvas-helper";
import { svgPropFillAndStroke, svgPropPassthrough } from "../../rendering/svg/svg-helper";
import { BaseElementOption } from "./base-elm-options";
import { PrimitiveElement } from "./primitive";

export interface LineOption extends BaseElementOption {
    x1: GeometryOptValue;
    x2: GeometryOptValue;
    y1: GeometryOptValue;
    y2: GeometryOptValue;
    shapeRendering: string;
    dashArray: string;
}

export class Line extends PrimitiveElement<LineOption> {
    public svgAttrs(): any {
        const { x, y, x1, x2, y1, y2 } = this.$geometry;
        return {
            ...svgPropFillAndStroke(this),
            ...svgPropPassthrough({
                "shape-rendering": "shapeRendering",
            })(this),
            x1: x1 === null ? x : x1,
            x2: x2 === null ? x : x2,
            y1: y1 === null ? y : y1,
            y2: y2 === null ? y : y2,
        };
    }

    public svgTagName() {
        return "line";
    }
    public svgTextContent() {
        return null;
    }

    public renderToCanvas(ctx: CanvasRenderingContext2D) {
        const { x, y, x1, x2, y1, y2 } = this.$geometry;
        this.path = new Path2D();
        this.path.moveTo(x1 === null ? x : x1, y1 === null ? y : y1);
        this.path.lineTo(x2 === null ? x : x2, y2 === null ? y : y2);
        canvasStroke(ctx, this);
    }

    public geometryProps() {
        const { h, v } = super.geometryProps();
        return {
            h: [...h, "x1", "x2"],
            v: [...v, "y1", "y2"],
        };
    }

    public defaultProp() {
        return {
            stroke: getThemeColor(this.$v.theme, "line"),
        };
    }

    public positionDetached = true;
}
