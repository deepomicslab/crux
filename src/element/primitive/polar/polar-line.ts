import { getThemeColor } from "../../../color";
import { GeometryOptValue } from "../../../defs/geometry";
import { canvasFill, canvasStroke } from "../../../rendering/canvas/canvas-helper";
import { svgPropFillAndStroke } from "../../../rendering/svg/svg-helper";
import { toCartesian } from "../../../utils/math";
import { BaseElement } from "../../base-element";
import { BaseElementOption } from "../base-elm-options";

export interface PolarLineOption extends BaseElementOption {
    x1: GeometryOptValue;
    x2: GeometryOptValue;
    r1: GeometryOptValue;
    r2: GeometryOptValue;
    rad: boolean;
}

export class PolarLine extends BaseElement<PolarLineOption> {
    public svgAttrs(): any {
        const [x1, y1, x2, y2] = this.getStartEnd();
        return {
            ...svgPropFillAndStroke(this),
            x1,
            y1,
            x2,
            y2,
        };
    }

    public svgTagName() {
        return "line";
    }
    public svgTextContent() {
        return null;
    }

    public renderToCanvas(ctx: CanvasRenderingContext2D) {
        const [x1, y1, x2, y2] = this.getStartEnd();
        this.path = new Path2D();
        this.path.moveTo(x1, y1);
        this.path.lineTo(x2, y2);
        canvasFill(ctx, this);
        canvasStroke(ctx, this);
    }

    public defaultProp() {
        return {
            stroke: getThemeColor(this.$v.theme, "line"),
            strokeWidth: 1,
        };
    }

    public geometryProps() {
        const { h, v } = super.geometryProps();
        return { h: [...h, "x1", "x2"], v: [...v, "r1", "r2"] };
    }

    private getStartEnd() {
        const isRad = !!this.prop.rad;
        const { x1, x2, r1, r2 } = this.$geometry;
        const [x1_, y1_] = toCartesian(x1, r1, isRad);
        const [x2_, y2_] = toCartesian(x2, r2, isRad);
        return [x1_, y1_, x2_, y2_];
    }

    public positionDetached = true;
}
