import { getThemeColor } from "../../../color";
import { GeometryOptValue } from "../../../defs/geometry";
import { canvasStroke } from "../../../rendering/canvas-helper";
import { svgPropFillAndStroke } from "../../../rendering/svg-helper";
import { toCartesian } from "../../../utils/math";
import { BaseElement } from "../../base-element";
import { BaseElementOption } from "../base-elm-options";

export interface RadicalLineOption extends BaseElementOption {
    r1: GeometryOptValue;
    r2: GeometryOptValue;
    rad: boolean;
}

export class RadicalLine extends BaseElement<RadicalLineOption> {
    public svgAttrs(): any {
        const isRad = !!this.prop.rad;
        const { x, r1, r2 } = this.$geometry;
        const [x1, y1] = toCartesian(x, r1, isRad);
        const [x2, y2] = toCartesian(x, r2, isRad);
        return {
            ...svgPropFillAndStroke(this),
            x1, y1, x2, y2,
        };
    }

    public svgTagName() { return "line"; }
    public svgTextContent() { return null; }

    public renderToCanvas(ctx: CanvasRenderingContext2D) {
        const isRad = !!this.prop.rad;
        const { x, r1, r2 } = this.$geometry;
        const [x1, y1] = toCartesian(x, r1, isRad);
        const [x2, y2] = toCartesian(x, r2, isRad);
        this.path = new Path2D();
        this.path.moveTo(x1, y1);
        this.path.lineTo(x2, y2);
        canvasStroke(ctx, this);
    }

    public defaultProp() {
        return {
            stroke: getThemeColor(this.$v.theme, "line"),
        };
    }

    public geometryProps() {
        const { h, v } = super.geometryProps();
        return { h, v: [...v, "r1", "r2"]};
    }

    public positionDetached = true;
}
