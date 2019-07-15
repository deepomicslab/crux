import { GeometryOptValue } from "../../../defs/geometry";
import { canvasFill, canvasStroke } from "../../../rendering/canvas-helper";
import { svgPropFillAndStroke } from "../../../rendering/svg-helper";
import { toCartesian, toRad } from "../../../utils/math";
import { BaseElement } from "../../base-element";
import { BaseElementOption } from "../base-elm-options";

export interface ArcLineOption extends BaseElementOption {
    x1: GeometryOptValue;
    x2: GeometryOptValue;
    r: GeometryOptValue;
}

export class ArcLine extends BaseElement<ArcLineOption> {
    public svgAttrs(): any {
        return {
            ...svgPropFillAndStroke(this),
            d: this.getPath(),
        };
    }

    public svgTagName() { return "path"; }
    public svgTextContent() { return null; }

    public renderToCanvas(ctx: CanvasRenderingContext2D) {
        const { x1, x2, r } = this.$geometry;
        this.path = new Path2D();
        this.path.arc(0, 0, r, toRad(x1 - 90), toRad(x2 - 90));
        canvasFill(ctx, this);
        canvasStroke(ctx, this);
    }

    public defaultProp() {
        return {
            stroke: "#000",
        };
    }

    public static geometryProps() {
        const { h, v } = super.geometryProps();
        return { h: [...h, "x1", "x2"], v: [...v, "r"]};
    }

    private getPath() {
        const { x1, x2, r } = this.$geometry;
        const [_x1, _y1] = toCartesian(x1, r);
        const [_x2, _y2] = toCartesian(x2, r);
        const largeArcFlag = x2 - x1 <= 180 ? "0" : "1";
        return `M${_x1},${_y1} A${r},${r},0,${largeArcFlag},1,${_x2},${_y2}`;
    }

    public positionDetached = true;
}
