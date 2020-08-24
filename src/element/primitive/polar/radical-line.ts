import { getThemeColor } from "../../../color";
import { GeometryOptValue } from "../../../defs/geometry";
import { canvasStroke } from "../../../rendering/canvas/canvas-helper";
import { svgPropFillAndStroke } from "../../../rendering/svg/svg-helper";
import { toCartesian } from "../../../utils/math";
import { BaseElement } from "../../base-element";
import { BaseElementOption } from "../base-elm-options";

export interface RadicalLineOption extends BaseElementOption {
    r1: GeometryOptValue;
    r2: GeometryOptValue;
    y1: GeometryOptValue;
    y2: GeometryOptValue;
    rad: boolean;
}

export class RadicalLine extends BaseElement<RadicalLineOption> {
    private getPosition() {
        const isRad = !!this.prop.rad;
        const { x, r1, r2, y1, y2 } = this.$geometry;
        const [x1_, y1_] = toCartesian(x, r1 ?? y1, isRad);
        const [x2_, y2_] = toCartesian(x, r2 ?? y2, isRad);
        return [x1_, y1_, x2_, y2_];
    }

    public svgAttrs(): any {
        const [x1, y1, x2, y2] = this.getPosition();
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
        const [x1, y1, x2, y2] = this.getPosition();
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
        return { h, v: [...v, "r1", "r2", "y1", "y2"] };
    }

    public positionDetached = true;
}
